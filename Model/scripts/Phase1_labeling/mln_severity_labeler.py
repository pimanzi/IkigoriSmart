"""
MLN Severity Labeling Pipeline - Phase 1 (Updated)
Automated weak supervision for Maize Lethal Necrosis severity classification.

Based on plant pathology literature (Prasanna et al., 2021) and validation analysis.
Updated with improved HSV ranges, adjusted thresholds, and preprocessing.

Technologies: Python, OpenCV, NumPy, HSV color segmentation, CLAHE
"""

import cv2
import numpy as np
import os
import json
import shutil
from pathlib import Path
from typing import Dict, Tuple


class MLNSeverityLabeler:
    """
    HSV-based color segmentation for MLN severity classification.
    
    Updated HSV ranges based on validation:
    - Green: H: 35-85, S: 50-255, V: 40-255 (reduced background interference)
    - Yellow: H: 18-38, S: 40-255, V: 100-255 (expanded for chlorotic variations)
    - Brown: H: 8-25, S: 30-220, V: 15-180 (expanded for necrotic tissue)
    
    Adjusted severity thresholds for better class balance:
    - Early: <12% affected AND necrosis <25%
    - Moderate: 12-35% affected OR necrosis 25-35%
    - Severe: >35% affected OR necrosis >35%
    """
    
    def __init__(self, use_clahe: bool = True):
        # Updated HSV ranges based on validation
        self.green_lower = np.array([35, 50, 40])
        self.green_upper = np.array([85, 255, 255])
        
        self.yellow_lower = np.array([18, 40, 100])
        self.yellow_upper = np.array([38, 255, 255])
        
        self.brown_lower = np.array([8, 30, 15])
        self.brown_upper = np.array([25, 220, 180])
        
        # Adjusted severity classification thresholds
        self.early_affected_max = 0.12
        self.early_necrosis_max = 0.25
        
        self.moderate_affected_min = 0.12
        self.moderate_affected_max = 0.35
        self.moderate_necrosis_min = 0.25
        self.moderate_necrosis_max = 0.35
        
        self.severe_affected_min = 0.35
        self.severe_necrosis_min = 0.35
        
        # Preprocessing options
        self.use_clahe = use_clahe
        if use_clahe:
            self.clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    
    def preprocess_image(self, img: np.ndarray) -> np.ndarray:
        """
        Apply preprocessing to normalize lighting and enhance contrast.
        
        Args:
            img: BGR image
            
        Returns:
            Preprocessed BGR image
        """
        if not self.use_clahe:
            return img
        
        # Convert to LAB color space
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        
        # Apply CLAHE to L channel
        l_clahe = self.clahe.apply(l)
        
        # Merge channels and convert back to BGR
        lab_clahe = cv2.merge([l_clahe, a, b])
        img_clahe = cv2.cvtColor(lab_clahe, cv2.COLOR_LAB2BGR)
        
        return img_clahe
    
    def apply_morphology(self, mask: np.ndarray) -> np.ndarray:
        """
        Apply morphological operations to clean up mask noise.
        
        Args:
            mask: Binary mask
            
        Returns:
            Cleaned binary mask
        """
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        
        # Remove noise
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)
        
        # Fill small holes
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=1)
        
        return mask
    
    def segment_leaf_tissue(self, image_path: str) -> Dict[str, float]:
        """
        Segment leaf tissue into green, yellow, and brown regions.
        
        Returns:
            Dictionary with pixel counts and computed metrics
        """
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Cannot read image: {image_path}")
        
        # Preprocess image
        img_processed = self.preprocess_image(img)
        
        # Convert to HSV
        hsv = cv2.cvtColor(img_processed, cv2.COLOR_BGR2HSV)
        
        # Create masks for each tissue type
        green_mask = cv2.inRange(hsv, self.green_lower, self.green_upper)
        yellow_mask = cv2.inRange(hsv, self.yellow_lower, self.yellow_upper)
        brown_mask = cv2.inRange(hsv, self.brown_lower, self.brown_upper)
        
        # Apply morphological operations
        green_mask = self.apply_morphology(green_mask)
        yellow_mask = self.apply_morphology(yellow_mask)
        brown_mask = self.apply_morphology(brown_mask)
        
        # Count pixels
        green_pixels = np.count_nonzero(green_mask)
        yellow_pixels = np.count_nonzero(yellow_mask)
        brown_pixels = np.count_nonzero(brown_mask)
        
        total_leaf_pixels = green_pixels + yellow_pixels + brown_pixels
        
        if total_leaf_pixels == 0:
            return {
                'green_pixels': 0,
                'yellow_pixels': 0,
                'brown_pixels': 0,
                'total_leaf_pixels': 0,
                'affected_percentage': 0.0,
                'necrosis_ratio': 0.0
            }
        
        affected_pixels = yellow_pixels + brown_pixels
        affected_percentage = affected_pixels / total_leaf_pixels
        
        # Necrosis ratio: proportion of necrotic tissue among affected tissue
        necrosis_ratio = brown_pixels / affected_pixels if affected_pixels > 0 else 0.0
        
        return {
            'green_pixels': int(green_pixels),
            'yellow_pixels': int(yellow_pixels),
            'brown_pixels': int(brown_pixels),
            'total_leaf_pixels': int(total_leaf_pixels),
            'affected_percentage': float(affected_percentage),
            'necrosis_ratio': float(necrosis_ratio)
        }
    
    def classify_severity(self, metrics: Dict[str, float]) -> str:
        """
        Classify MLN severity based on affected area and necrosis ratio.
        
        Updated thresholds based on validation analysis:
        - Early: <12% affected AND <25% necrosis
        - Moderate: 12-35% affected OR 25-35% necrosis
        - Severe: >35% affected OR >35% necrosis
        """
        affected_pct = metrics['affected_percentage']
        necrosis_ratio = metrics['necrosis_ratio']
        
        # Severe: high affected area OR high necrosis
        if affected_pct > self.severe_affected_min or necrosis_ratio > self.severe_necrosis_min:
            return 'Severe'
        
        # Moderate: intermediate affected area OR moderate necrosis
        if (affected_pct >= self.moderate_affected_min or 
            necrosis_ratio >= self.moderate_necrosis_min):
            return 'Moderate'
        
        # Early: low affected area AND low necrosis
        return 'Early'
    
    def process_image(self, image_path: str) -> Dict:
        """Process single image and return severity label with metrics."""
        metrics = self.segment_leaf_tissue(image_path)
        severity = self.classify_severity(metrics)
        
        return {
            'image_path': image_path,
            'severity': severity,
            'metrics': metrics
        }
    
    def process_directory(self, input_dir: str, output_json: str, organize_folders: bool = False, output_dir: str = None):
        """
        Process all images in directory and save results.
        
        Args:
            input_dir: Path to MLN images directory
            output_json: Path to save labeling results
            organize_folders: If True, copy images to severity folders
            output_dir: Base directory for organized folders
        """
        input_path = Path(input_dir)
        results = []
        
        # Create severity folders if organizing
        if organize_folders:
            if output_dir is None:
                output_dir = Path(input_dir).parent / 'mln_labels_v2'
            else:
                output_dir = Path(output_dir)
            
            for severity in ['Early', 'Moderate', 'Severe']:
                (output_dir / severity).mkdir(parents=True, exist_ok=True)
            print(f"Created severity folders in {output_dir}")
        
        image_extensions = {'.jpg', '.jpeg', '.png', '.JPEG', '.JPG', '.PNG'}
        image_files = [f for f in input_path.iterdir() 
                      if f.suffix in image_extensions]
        
        print(f"Processing {len(image_files)} images from {input_dir}")
        print(f"Using CLAHE preprocessing: {self.use_clahe}")
        
        for idx, img_file in enumerate(image_files, 1):
            try:
                result = self.process_image(str(img_file))
                results.append(result)
                
                # Copy to severity folder if organizing
                if organize_folders:
                    severity = result['severity']
                    dest_path = output_dir / severity / img_file.name
                    shutil.copy2(img_file, dest_path)
                
                if idx % 100 == 0:
                    print(f"Processed {idx}/{len(image_files)} images")
                    
            except Exception as e:
                print(f"Error processing {img_file.name}: {e}")
        
        # Save results
        with open(output_json, 'w') as f:
            json.dump(results, f, indent=2)
        
        # Print summary statistics
        severity_counts = {}
        for result in results:
            severity = result['severity']
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
        
        print(f"\nLabeling complete. Results saved to {output_json}")
        if organize_folders:
            print(f"Images organized in {output_dir}")
        print("\nSeverity distribution:")
        for severity, count in sorted(severity_counts.items()):
            percentage = (count / len(results)) * 100
            print(f"  {severity}: {count} ({percentage:.1f}%)")


def main():
    """
    Main execution: Label MLN images with severity levels.
    
    Updated version with improved HSV ranges and thresholds based on validation.
    """
    labeler = MLNSeverityLabeler(use_clahe=True)
    
    # Paths
    mln_dir = '/Users/kabisa_03/Documents/capstone/IkigoriSmart/raw_data/MLN'
    output_json = '/Users/kabisa_03/Documents/capstone/IkigoriSmart/scripts/Phase1_labeling/mln_severity_labels_v2.json'
    output_folders = '/Users/kabisa_03/Documents/capstone/IkigoriSmart/mln_labels_v2'
    
    # Process all MLN images with updated parameters
    labeler.process_directory(mln_dir, output_json, organize_folders=True, output_dir=output_folders)


if __name__ == '__main__':
    main()

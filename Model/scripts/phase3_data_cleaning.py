#!/usr/bin/env python3
"""
=============================================================================
PHASE 3: DATA CLEANING - LOW CONFIDENCE IMAGE REVIEW
=============================================================================

This script identifies images that the model is uncertain about or misclassified.
These images should be manually reviewed to:
1. Remove mislabeled images
2. Remove poor quality images
3. Relabel images to correct severity class

Usage:
    python phase3_data_cleaning.py

Output:
    - data_review/incorrect_predictions/    : Misclassified images
    - data_review/low_confidence_correct/   : Low confidence but correct
    - data_review/moderate_class_review/    : Moderate class issues
    - data_review/images_to_review.json     : Full review list
    - data_review/REVIEW_INSTRUCTIONS.txt   : Manual review guide

Author: IkigoriSmart Team
Date: February 2026
=============================================================================
"""

import os
import sys
import json
import shutil
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path
from PIL import Image

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

# TensorFlow imports
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications.resnet_v2 import preprocess_input as resnet_preprocess
import tensorflow.keras.backend as K


# =============================================================================
# CONFIGURATION
# =============================================================================

class Config:
    """Configuration for Phase 3 data cleaning."""
    
    # Paths
    DATA_DIR = Path(__file__).parent.parent / 'mln_labels_v2'
    MODEL_PATH = Path(__file__).parent.parent / 'notebooks' / 'best_model_final.h5'
    OUTPUT_DIR = Path(__file__).parent.parent / 'data_review'
    
    # Image parameters
    IMG_SIZE = 224
    BATCH_SIZE = 32
    
    # Review thresholds
    CONFIDENCE_THRESHOLD = 0.60  # Review images below this confidence
    
    # Class names
    CLASS_NAMES = ['Early', 'Moderate', 'Severe']
    
    # Focal loss parameters (for loading model)
    FOCAL_GAMMA = 2.0
    FOCAL_ALPHA = 0.25


def focal_loss(gamma=2.0, alpha=0.25):
    """Focal Loss function (needed for model loading)."""
    def focal_loss_fn(y_true, y_pred):
        epsilon = K.epsilon()
        y_pred = K.clip(y_pred, epsilon, 1.0 - epsilon)
        cross_entropy = -y_true * K.log(y_pred)
        focal_weight = K.pow(1 - y_pred, gamma)
        loss = alpha * focal_weight * cross_entropy
        return K.sum(loss, axis=-1)
    return focal_loss_fn


def load_trained_model(model_path, config):
    """Load the trained model with custom objects."""
    print(f"Loading model from: {model_path}")
    
    custom_objects = {
        'focal_loss_fn': focal_loss(config.FOCAL_GAMMA, config.FOCAL_ALPHA)
    }
    
    model = load_model(str(model_path), custom_objects=custom_objects)
    print("Model loaded successfully")
    return model


def create_data_generator(data_dir, config):
    """Create data generator for predictions."""
    datagen = ImageDataGenerator(
        preprocessing_function=resnet_preprocess
    )
    
    generator = datagen.flow_from_directory(
        str(data_dir),
        target_size=(config.IMG_SIZE, config.IMG_SIZE),
        batch_size=config.BATCH_SIZE,
        class_mode='categorical',
        shuffle=False
    )
    
    return generator


def generate_predictions(model, generator):
    """Generate predictions for all images."""
    print("Generating predictions...")
    generator.reset()
    
    predictions = model.predict(generator, verbose=1)
    predicted_classes = np.argmax(predictions, axis=1)
    confidence_scores = np.max(predictions, axis=1)
    true_classes = generator.classes
    filenames = generator.filenames
    class_names = list(generator.class_indices.keys())
    
    return {
        'predictions': predictions,
        'predicted_classes': predicted_classes,
        'confidence_scores': confidence_scores,
        'true_classes': true_classes,
        'filenames': filenames,
        'class_names': class_names
    }


def categorize_images_for_review(pred_data, config):
    """Categorize images into review categories."""
    review_list = {
        'incorrect': [],
        'low_confidence_correct': [],
        'moderate_low_conf': []
    }
    
    for idx in range(len(pred_data['predicted_classes'])):
        true_class = pred_data['true_classes'][idx]
        pred_class = pred_data['predicted_classes'][idx]
        confidence = pred_data['confidence_scores'][idx]
        filename = pred_data['filenames'][idx]
        
        true_label = pred_data['class_names'][true_class]
        pred_label = pred_data['class_names'][pred_class]
        
        item = {
            'filename': filename,
            'true_label': true_label,
            'predicted_label': pred_label,
            'confidence': float(confidence),
            'true_class_idx': int(true_class),
            'pred_class_idx': int(pred_class)
        }
        
        # Category 1: Incorrect predictions (highest priority)
        if pred_class != true_class:
            item['reason'] = 'incorrect_prediction'
            review_list['incorrect'].append(item)
        
        # Category 2: Low confidence but correct
        elif confidence < config.CONFIDENCE_THRESHOLD:
            item['reason'] = 'low_confidence'
            review_list['low_confidence_correct'].append(item)
        
        # Category 3: Moderate class with low confidence
        if true_label == 'Moderate' and confidence < 0.65:
            item['reason'] = 'moderate_ambiguous'
            review_list['moderate_low_conf'].append(item)
    
    # Sort by confidence (lowest first)
    for key in review_list:
        review_list[key].sort(key=lambda x: x['confidence'])
    
    return review_list


def copy_review_images(review_list, data_dir, output_dir, max_images=100):
    """Copy images to review folders with metadata in filename."""
    copied_counts = {}
    
    categories = {
        'incorrect': 'incorrect_predictions',
        'low_confidence_correct': 'low_confidence_correct',
        'moderate_low_conf': 'moderate_class_review'
    }
    
    for category, folder_name in categories.items():
        dest_folder = output_dir / folder_name
        dest_folder.mkdir(parents=True, exist_ok=True)
        
        copied = 0
        for item in review_list[category][:max_images]:
            src_path = data_dir / item['filename']
            
            # Create descriptive filename
            base_name = Path(item['filename']).stem
            new_name = f"{base_name}_TRUE-{item['true_label']}_PRED-{item['predicted_label']}_CONF-{item['confidence']:.3f}.jpg"
            dest_path = dest_folder / new_name
            
            if src_path.exists():
                shutil.copy2(src_path, dest_path)
                copied += 1
        
        copied_counts[category] = copied
        print(f"  Copied {copied} images to {folder_name}/")
    
    return copied_counts


def visualize_worst_predictions(review_list, data_dir, output_dir, max_display=12):
    """Create visualization of worst predictions."""
    print("\nCreating visualization of worst predictions...")
    
    for category, title in [
        ('incorrect', 'Incorrect Predictions (Highest Priority)'),
        ('moderate_low_conf', 'Moderate Class - Low Confidence')
    ]:
        items = review_list[category][:max_display]
        
        if not items:
            continue
        
        cols = 4
        rows = (len(items) + cols - 1) // cols
        
        fig, axes = plt.subplots(rows, cols, figsize=(16, 4*rows))
        axes = axes.flatten() if rows > 1 else [axes] if cols == 1 else axes.flatten()
        
        for idx, item in enumerate(items):
            img_path = data_dir / item['filename']
            
            if img_path.exists():
                img = Image.open(img_path)
                axes[idx].imshow(img)
                
                color = 'red' if item['reason'] == 'incorrect_prediction' else 'orange'
                
                title_text = f"True: {item['true_label']}\n"
                title_text += f"Pred: {item['predicted_label']}\n"
                title_text += f"Conf: {item['confidence']:.3f}"
                
                axes[idx].set_title(title_text, fontsize=9, color=color, fontweight='bold')
                axes[idx].axis('off')
        
        # Hide unused subplots
        for idx in range(len(items), len(axes)):
            axes[idx].axis('off')
        
        plt.suptitle(title, fontsize=14, fontweight='bold')
        plt.tight_layout()
        
        save_name = f"{category}_visualization.png"
        plt.savefig(output_dir / save_name, dpi=150, bbox_inches='tight')
        plt.close()
        print(f"  Saved: {save_name}")


def analyze_confusion_patterns(review_list):
    """Analyze which classes are most confused."""
    confusion_details = {}
    
    for item in review_list['incorrect']:
        key = f"{item['true_label']} -> {item['predicted_label']}"
        if key not in confusion_details:
            confusion_details[key] = []
        confusion_details[key].append(item)
    
    return confusion_details


def generate_review_instructions(review_list, output_dir, confusion_details):
    """Generate instructions file for manual review."""
    
    total_review = len(review_list['incorrect']) + len(review_list['low_confidence_correct'])
    
    instructions = f"""
================================================================================
PHASE 3: DATA CLEANING - MANUAL REVIEW INSTRUCTIONS
================================================================================

Generated: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

SUMMARY
-------
Total images to review: {total_review}
  - Incorrect predictions:    {len(review_list['incorrect'])} images (PRIORITY 1)
  - Low confidence correct:   {len(review_list['low_confidence_correct'])} images (PRIORITY 2)
  - Moderate class issues:    {len(review_list['moderate_low_conf'])} images (PRIORITY 3)


CONFUSION PATTERNS (Most Common Errors)
---------------------------------------
"""
    
    for pattern, items in sorted(confusion_details.items(), key=lambda x: len(x[1]), reverse=True):
        avg_conf = np.mean([x['confidence'] for x in items])
        instructions += f"  {pattern:<25} {len(items):>3} images (avg conf: {avg_conf:.3f})\n"
    
    instructions += f"""

REVIEW FOLDERS
--------------
1. incorrect_predictions/
   - These images were MISCLASSIFIED by the model
   - PRIORITY 1: Review all of these
   - Filename format: <original>_TRUE-<label>_PRED-<prediction>_CONF-<score>.jpg

2. low_confidence_correct/
   - Model was CORRECT but UNSURE (confidence < 60%)
   - PRIORITY 2: Review if time permits
   - May indicate ambiguous or borderline cases

3. moderate_class_review/
   - Focus on "Moderate" class issues
   - PRIORITY 3: Moderate is often confused with Early/Severe


HOW TO REVIEW IMAGES
--------------------
For each image, decide ONE of the following actions:

1. KEEP AS-IS
   - The current label is CORRECT
   - Image quality is acceptable
   - Do nothing, leave the image in place

2. DELETE
   - Image is POOR QUALITY (blurry, too dark, partial leaf)
   - Image shows MULTIPLE DISEASES (not just MLN)
   - Image is UNCLEAR or AMBIGUOUS
   - Action: Delete from the original dataset folder:
     {output_dir.parent / 'mln_labels_v2'}/

3. RELABEL (Move to correct folder)
   - The TRUE label is WRONG
   - Move image to the CORRECT severity folder:
     - Early symptoms -> move to Early/
     - Moderate symptoms -> move to Moderate/
     - Severe symptoms -> move to Severe/


VISUAL GUIDE FOR MLN SEVERITY
-----------------------------
EARLY:
  - Small chlorotic spots/streaks on leaves
  - <20% of leaf affected
  - Mostly green leaf with scattered yellow spots

MODERATE:
  - 20-50% of leaf affected
  - Clear chlorotic streaking patterns
  - Mix of green and yellow/necrotic areas

SEVERE:
  - >50% of leaf affected
  - Extensive necrosis (brown/dead tissue)
  - Little healthy green tissue remaining


RECOMMENDED WORKFLOW
--------------------
1. Open the incorrect_predictions/ folder
2. View each image (filename shows true vs predicted label)
3. Decide: KEEP, DELETE, or RELABEL
4. For DELETE: Remove from {output_dir.parent / 'mln_labels_v2'}/<class>/
5. For RELABEL: Move to correct class folder
6. Repeat for low_confidence_correct/ if time permits

EXPECTED TIME: 1-2 hours for full review


AFTER REVIEW - NEXT STEPS
-------------------------
1. Delete images marked for removal from mln_labels_v2/
2. Move relabeled images to correct folders
3. Run Phase 3b: Retrain on cleaned dataset
4. Expected accuracy improvement: 78.9% -> 82-85%
5. Then proceed to Phase 4: Add healthy class


OUTPUT FILES
------------
- images_to_review.json : Full list of images with metadata
- incorrect_visualization.png : Visual grid of worst predictions
- moderate_class_review_visualization.png : Moderate class issues
- This file: REVIEW_INSTRUCTIONS.txt

================================================================================
"""
    
    instructions_path = output_dir / 'REVIEW_INSTRUCTIONS.txt'
    with open(instructions_path, 'w') as f:
        f.write(instructions)
    
    return instructions_path


def main():
    """Main function to run Phase 3 data cleaning."""
    
    print("=" * 70)
    print("PHASE 3: DATA CLEANING - LOW CONFIDENCE IMAGE REVIEW")
    print("=" * 70)
    print()
    
    config = Config()
    
    # Check paths exist
    if not config.DATA_DIR.exists():
        print(f"ERROR: Data directory not found: {config.DATA_DIR}")
        sys.exit(1)
    
    if not config.MODEL_PATH.exists():
        print(f"ERROR: Model file not found: {config.MODEL_PATH}")
        print("Please ensure Phase 2 training is complete.")
        sys.exit(1)
    
    # Create output directory
    config.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Step 1: Load model
    print("Step 1: Loading trained model...")
    model = load_trained_model(config.MODEL_PATH, config)
    
    # Step 2: Create data generator
    print("\nStep 2: Creating data generator...")
    generator = create_data_generator(config.DATA_DIR, config)
    
    # Step 3: Generate predictions
    print("\nStep 3: Generating predictions...")
    pred_data = generate_predictions(model, generator)
    
    # Step 4: Categorize images for review
    print("\nStep 4: Categorizing images for review...")
    review_list = categorize_images_for_review(pred_data, config)
    
    print()
    print("=" * 70)
    print("IMAGES IDENTIFIED FOR REVIEW")
    print("=" * 70)
    print(f"  Incorrect Predictions:        {len(review_list['incorrect'])} images")
    print(f"  Low Confidence (Correct):     {len(review_list['low_confidence_correct'])} images")
    print(f"  Moderate Class Issues:        {len(review_list['moderate_low_conf'])} images")
    total = len(review_list['incorrect']) + len(review_list['low_confidence_correct'])
    print(f"  TOTAL TO REVIEW:              {total} images")
    print("=" * 70)
    
    # Step 5: Copy images to review folders
    print("\nStep 5: Copying images to review folders...")
    copy_review_images(review_list, config.DATA_DIR, config.OUTPUT_DIR)
    
    # Step 6: Save review list to JSON
    print("\nStep 6: Saving review list...")
    json_path = config.OUTPUT_DIR / 'images_to_review.json'
    with open(json_path, 'w') as f:
        json.dump(review_list, f, indent=2)
    print(f"  Saved: {json_path}")
    
    # Step 7: Create visualizations
    print("\nStep 7: Creating visualizations...")
    visualize_worst_predictions(review_list, config.DATA_DIR, config.OUTPUT_DIR)
    
    # Step 8: Analyze confusion patterns
    print("\nStep 8: Analyzing confusion patterns...")
    confusion_details = analyze_confusion_patterns(review_list)
    
    print("\nMost Common Confusion Patterns:")
    print("-" * 50)
    for pattern, items in sorted(confusion_details.items(), key=lambda x: len(x[1]), reverse=True)[:5]:
        avg_conf = np.mean([x['confidence'] for x in items])
        print(f"  {pattern:<25} {len(items):>3} images (avg conf: {avg_conf:.3f})")
    
    # Step 9: Generate instructions
    print("\nStep 9: Generating review instructions...")
    instructions_path = generate_review_instructions(review_list, config.OUTPUT_DIR, confusion_details)
    print(f"  Saved: {instructions_path}")
    
    # Final summary
    print()
    print("=" * 70)
    print("PHASE 3 DATA REVIEW SETUP COMPLETE")
    print("=" * 70)
    print(f"""
OUTPUT LOCATION: {config.OUTPUT_DIR}

NEXT STEPS:
-----------
1. Open the review folder:
   open {config.OUTPUT_DIR}

2. Read REVIEW_INSTRUCTIONS.txt for detailed guidance

3. Review images in each folder:
   - incorrect_predictions/ (PRIORITY 1)
   - low_confidence_correct/ (PRIORITY 2)
   - moderate_class_review/ (PRIORITY 3)

4. For each image, decide: KEEP, DELETE, or RELABEL

5. Make changes to the original dataset:
   {config.DATA_DIR}

6. After review, run Phase 3b retraining

ESTIMATED REVIEW TIME: 1-2 hours
""")
    print("=" * 70)


if __name__ == '__main__':
    main()

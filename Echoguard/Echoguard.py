
import numpy as np
import librosa
import pandas as pd
import os
from tqdm import tqdm # A library for displaying progress bars

# --- 1. Feature Extraction Function ---
def extract_features(file_path, n_mfcc=13):
    """Loads audio and extracts aggregated MFCC, Delta, and Delta-Delta features."""
    try:
        # Load audio at native sample rate (sr=None)
        y, sr = librosa.load(file_path, sr=None)
        
        # 1. MFCCs
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=n_mfcc)
        
        # 2. Delta (1st difference) and Delta-Delta (2nd difference)
        mfccs_delta = librosa.feature.delta(mfccs)
        mfccs_delta2 = librosa.feature.delta(mfccs, order=2)
        
        # Combine all features
        combined_features = np.vstack([mfccs, mfccs_delta, mfccs_delta2])
        
        # Aggregate: Calculate Mean and Standard Deviation across all time frames
        mean_features = np.mean(combined_features, axis=1)
        std_features = np.std(combined_features, axis=1)
        
        # Create a single feature vector
        final_vector = np.hstack([mean_features, std_features])
        
        return final_vector

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None # Return None if processing fails

# --- 2. Batch Processing ---
def process_dataset(data_dir):
    """
    Loops through all files in a directory and extracts features.
    
    Args:
        data_dir (str): The path to the folder containing the audio files.
    """
    all_data = []
    
    # Use os.listdir to get all files in the directory
    files = os.listdir(data_dir)
    
    # Use tqdm to show a progress bar
    print(f"\nProcessing files in: {data_dir}")
    for filename in tqdm(files):
        if filename.endswith(('.wav', '.mp3', '.flac')):
            file_path = os.path.join(data_dir, filename)
            
            # Extract features
            features = extract_features(file_path)
            
            if features is not None:
                # Add the features to our list
                all_data.append(features)
                
    return np.array(all_data)

# --- 3. Run the Processing and Save ---
if __name__ == '__main__':
    # Define the directory paths
    REAL_DIR = 'Real_Audio'
    FAKE_DIR = 'Fake_Audio'
    
    # Process the real and fake data
    real_features = process_dataset(REAL_DIR)
    fake_features = process_dataset(FAKE_DIR)
    
    # --- 4. Create Labels ---
    # Create the 'y' labels for the machine learning model: 
    # 0 for Real, 1 for Fake (or vice-versa, just be consistent)
    real_labels = np.zeros(real_features.shape[0])  # Array of 0s
    fake_labels = np.ones(fake_features.shape[0])   # Array of 1s
    
    # --- 5. Combine and Finalize Dataset ---
    
    # Combine the feature arrays (X)
    X = np.vstack([real_features, fake_features])
    
    # Combine the labels arrays (y)
    y = np.hstack([real_labels, fake_labels])
    
    # Save the final data for machine learning training
    np.save('X_features.npy', X)
    np.save('y_labels.npy', y)
    
    print("\n--- Processing Complete ---")
    print(f"Total Features (X) Shape: {X.shape}") # Should be (500, 78) if 500 files and 78 features
    print(f"Total Labels (y) Shape: {y.shape}")   # Should be (500,)
    print("Features and labels saved as 'X_features.npy' and 'y_labels.npy'")
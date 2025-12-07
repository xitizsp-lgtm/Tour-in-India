import numpy as np
import librosa
import pandas as pd
import os
from tqdm import tqdm # A library for displaying progress bars
import glob

# --- 1. Feature Extraction Function ---
def extract_features(file_path, n_mfcc=13):
    """Loads audio and extracts aggregated MFCC, Delta, and Delta-Delta features."""
    try:
        # Load audio at native sample rate (sr=None)
        # Using mono=True is generally recommended for feature extraction
        y, sr = librosa.load(file_path, sr=None, mono=True) 
        
        # 1. MFCCs
        # The hop_length is set to the default (512) for standard feature extraction
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=n_mfcc)
        
        # 2. Delta (1st difference) and Delta-Delta (2nd difference)
        mfccs_delta = librosa.feature.delta(mfccs)
        mfccs_delta2 = librosa.feature.delta(mfccs, order=2)
        
        # Combine all features (mfccs, delta, delta-delta)
        combined_features = np.vstack([mfccs, mfccs_delta, mfccs_delta2])
        
        # Aggregate: Calculate Mean and Standard Deviation across all time frames (axis=1)
        mean_features = np.mean(combined_features, axis=1)
        std_features = np.std(combined_features, axis=1)
        
        # Create a single feature vector
        # If n_mfcc=13, this vector will have 3 * 13 * 2 = 78 elements
        final_vector = np.hstack([mean_features, std_features])
        
        return final_vector

    except Exception as e:
        # Added os.path.basename to keep the error message clean
        print(f"Error processing {os.path.basename(file_path)}: {e}") 
        return None # Return None if processing fails
    

# --- 2. Batch Processing ---
def process_dataset(data_dir, file_exts=('.wav', '.mp3', '.flac')):
    """
    Loops through all specified audio files in a directory and extracts features.
    
    Args:
        data_dir (str): The path to the folder containing the audio files.
        file_exts (tuple): A tuple of file extensions to process.
    """
    all_features = []
    
    # Use glob to find all files matching the extensions
    # Use recursive=True if you need to search subfolders as well
    search_path = os.path.join(data_dir, '*') 
    all_files = [f for f in glob.glob(search_path) if f.lower().endswith(file_exts)]
    
    print(f"\nProcessing {len(all_files)} files in: {data_dir}")
    
    # Use tqdm to show a progress bar
    for file_path in tqdm(all_files):
        # Extract features
        features = extract_features(file_path)
        
        if features is not None:
            # Add the features to our list
            all_features.append(features)
            
    # Convert the list of arrays into a single 2D NumPy array
    return np.array(all_features)

# --- 3. Run the Processing and Save ---
if __name__ == '__main__':
    # Define the directory paths (Ensure these folders exist and contain audio files)
    # Folders must be named 'REAL' and 'FAKE' in the same directory as this script.
    REAL_DIR = 'Echoguard/REAL' 
    FAKE_DIR = 'Echoguard/FAKE' 
    
    # --- Check for Directories ---
    if not os.path.isdir(REAL_DIR) or not os.path.isdir(FAKE_DIR):
        print("!!! ERROR: One or both directories (REAL, FAKE) were not found.")
        print("Please ensure the folders are in the same location as this script.")
    else:
        # Process the real and fake data
        real_features = process_dataset(REAL_DIR)
        fake_features = process_dataset(FAKE_DIR)
        
        # Check if any features were successfully extracted
        if real_features.size == 0 and fake_features.size == 0:
            print("!!! ERROR: No features were successfully extracted. Check file paths and audio formats.")
        else:
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
            print(f"Total Features (X) Shape: {X.shape}") 
            print(f"Total Labels (y) Shape: {y.shape}") 
            print("Features and labels saved as 'X_features.npy' and 'y_labels.npy'")
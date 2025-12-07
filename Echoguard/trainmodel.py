import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import pandas as pd
import os
import joblib # <--- ADDED: Library for saving the model

# --- 1. Load Data ---
def load_data(X_path='X_features.npy', y_path='y_labels.npy'):
    """Loads feature and label arrays from disk."""
    if not os.path.exists(X_path) or not os.path.exists(y_path):
        print(f"!!! ERROR: Data files not found. Ensure '{X_path}' and '{y_path}' are in the current directory.")
        return None, None
    
    X = np.load(X_path)
    y = np.load(y_path)
    print(f"Data loaded. Features (X) shape: {X.shape}, Labels (y) shape: {y.shape}")
    return X, y

# --- 2. Preprocessing and Splitting ---
def preprocess_and_split(X, y, test_size=0.2, random_state=42):
    """Scales features and splits data into training and testing sets."""
    
    # Check for empty data
    if X.shape[0] == 0:
        print("!!! ERROR: Feature matrix is empty. Cannot train model.")
        return None, None, None, None
        
    # a. Split Data: Reserve data for testing
    print(f"Splitting data into {100*(1-test_size):.0f}% train and {100*test_size:.0f}% test...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )
    
    # b. Scale Features: Standardize features to have mean=0 and std=1
    # Scaling prevents features with large magnitudes from dominating the classifier.
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    print("Features scaled successfully.")
    # RETURN THE SCALER OBJECT
    return X_train_scaled, X_test_scaled, y_train, y_test, scaler 

# --- 3. Model Training ---
def train_model(X_train, y_train):
    """Trains a Support Vector Machine (SVM) classifier."""
    print("Starting SVM model training...")
    
    # Initialize SVM: Using a radial basis function (rbf) kernel is common for complex data.
    model = SVC(kernel='rbf', C=10, gamma='scale', random_state=42)
    
    # Train the model
    model.fit(X_train, y_train)
    print("Model training complete.")
    return model

# --- 4. Evaluation ---
def evaluate_model(model, X_test, y_test):
    """Evaluates the model and prints performance metrics."""
    
    # Make predictions on the test set
    y_pred = model.predict(X_test)
    
    print("\n" + "="*50)
    print("           MODEL EVALUATION RESULTS")
    print("="*50)
    
    # Overall Accuracy
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Overall Accuracy: {accuracy*100:.2f}%\n")
    
    # Detailed Report (Precision, Recall, F1-Score)
    # Target Names: 0 = REAL, 1 = FAKE
    print("Classification Report:")
    print(classification_report(y_test, y_pred, target_names=['REAL (0)', 'FAKE (1)']))
    
    # Confusion Matrix 
    cm = confusion_matrix(y_test, y_pred)
    cm_df = pd.DataFrame(cm, index=['Actual REAL', 'Actual FAKE'], columns=['Predicted REAL', 'Predicted FAKE'])
    print("Confusion Matrix:")
    print(cm_df)
    print("="*50)


# --- Main Execution ---
if __name__ == '__main__':
    # 1. Load Data
    X, y = load_data()
    
    if X is None:
        exit() # Stop if data loading failed

    # 2. Preprocess and Split
    # The 'scaler' object is now returned here
    X_train, X_test, y_train, y_test, scaler = preprocess_and_split(X, y) 
    
    if X_train is None:
        exit() # Stop if splitting failed

    # 3. Model Training
    svm_model = train_model(X_train, y_train)

    # 4. Evaluation
    evaluate_model(svm_model, X_test, y_test)
    
    # --- 5. Save the Model and Scaler for Deployment --- <--- ADDED SECTION
    print("\nSaving model and scaler for web deployment...")
    joblib.dump(svm_model, 'svm_model.pkl')
    joblib.dump(scaler, 'scaler.pkl')
    print("Files saved: 'svm_model.pkl' and 'scaler.pkl'")
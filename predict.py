import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image

# Load the EfficientNet-B0 model
model = models.efficientnet_b0(
    weights=None
)

# Replace the classifier
model.classifier[1] = nn.Linear(
    model.classifier[1].in_features,
    6
)

# Load the trained weights
model.load_state_dict(
    torch.load("saved_models/ecg_model.pth", map_location="cpu")
)

# Set the model to evaluation mode
model.eval()

print("Model loaded successfully!")

# Image transformations
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# Ask user for image path
image_path = input("Enter ECG image path: ").strip().strip('"')

# Load image
image = Image.open(image_path).convert("RGB")

# Apply transformations
image = transform(image)

# Add batch dimension
image = image.unsqueeze(0)

# Class names
classes = ['F', 'M', 'N', 'Q', 'S', 'V']

# Make prediction
with torch.no_grad():
    outputs = model(image)

# Get probabilities
probabilities = torch.softmax(outputs, dim=1)

# Get predicted class
confidence, predicted = torch.max(probabilities, 1)

# Show results
# ECG information for each class
ecg_info = {
    "F": {
        "name": "Fusion Beat",
        "risk": "🟡 Moderate",
        "description": "Fusion of normal and ventricular beats detected.",
        "recommendation": "Clinical evaluation is recommended."
    },
    "M": {
        "name": "Myocardial Beat",
        "risk": "🟡 Moderate",
        "description": "Possible myocardial abnormality detected.",
        "recommendation": "Consult a cardiologist for further assessment."
    },
    "N": {
        "name": "Normal Beat",
        "risk": "🟢 Low",
        "description": "No abnormal heartbeat detected.",
        "recommendation": "No immediate action required. Maintain a healthy lifestyle."
    },
    "Q": {
        "name": "Unknown Beat",
        "risk": "🟠 Medium",
        "description": "Heartbeat could not be confidently classified.",
        "recommendation": "Repeat ECG or consult a healthcare professional."
    },
    "S": {
        "name": "Supraventricular Ectopic Beat",
        "risk": "🟠 Medium",
        "description": "Abnormal supraventricular heartbeat detected.",
        "recommendation": "Medical consultation is recommended."
    },
    "V": {
        "name": "Ventricular Ectopic Beat",
        "risk": "🔴 High",
        "description": "Abnormal ventricular heartbeat detected.",
        "recommendation": "Immediate cardiologist consultation is advised."
    }
}

predicted_class = classes[predicted.item()]
info = ecg_info[predicted_class]

print("\n-----------------------------------------")
print("🩺 ECG ANALYSIS REPORT")
print("-----------------------------------------\n")

print(f"Predicted Class :")
print(f"{predicted_class} ({info['name']})\n")

print("Confidence :")
print(f"{confidence.item()*100:.2f}%\n")

print("Risk Level :")
print(f"{info['risk']}\n")

print("Description :")
print(f"{info['description']}\n")

print("Recommendation :")
print(f"{info['recommendation']}\n")

print("-----------------------------------------")
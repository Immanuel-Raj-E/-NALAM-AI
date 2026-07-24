import torch
import torch.nn as nn
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader

# Image transformations

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# Load the training dataset
train_dataset = datasets.ImageFolder(
    root="dataset/train",
    transform=transform
)

# Load the testing dataset
test_dataset = datasets.ImageFolder(
    root="dataset/test",
    transform=transform
)

# Create DataLoaders
train_loader = DataLoader(
    train_dataset,
    batch_size=32,
    shuffle=True
)

test_loader = DataLoader(
    test_dataset,
    batch_size=32,
    shuffle=False
)

print("Classes:", train_dataset.classes)
print("Number of Training Images:", len(train_dataset))
print("Number of Testing Images:", len(test_dataset))

# Load the pre-trained EfficientNet-B0 model
model = models.efficientnet_b0(
    weights=models.EfficientNet_B0_Weights.DEFAULT
)

# Replace the classifier
model.classifier[1] = nn.Linear(
    in_features=model.classifier[1].in_features,
    out_features=6
)
print("\nClassifier replaced successfully!")

# Freeze all pre-trained layers
for param in model.parameters():
    param.requires_grad = False

# Unfreeze only the classifier
for param in model.classifier.parameters():
    param.requires_grad = True

print("Transfer Learning setup completed!")

# Loss Function
criterion = nn.CrossEntropyLoss()

# Optimizer
optimizer = torch.optim.Adam(
    model.classifier.parameters(),
    lr=0.001
)

print("Loss function and optimizer created!")

# Use GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = model.to(device)

print(f"Using device: {device}")

# Train for 10 epochs
epochs = 10

for epoch in range(epochs):

    model.train()

    running_loss = 0.0

    for batch_idx, (images, labels) in enumerate(train_loader):

        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(outputs, labels)

        loss.backward()

        optimizer.step()

        running_loss += loss.item()
        if batch_idx % 100 == 0:
          print(f"Epoch [{epoch+1}/{epochs}] Loss: {running_loss/len(train_loader):.4f}")

torch.save(
    model.state_dict(),
    f"saved_models/ecg_epoch_{epoch+1}.pth"
)

print(f"Epoch {epoch+1} model saved!")

    # Evaluation
model.eval()

correct = 0
total = 0

with torch.no_grad():
    for images, labels in test_loader:

        images = images.to(device)
        labels = labels.to(device)

        outputs = model(images)

        _, predicted = torch.max(outputs, 1)

        total += labels.size(0)

        correct += (predicted == labels).sum().item()

accuracy = 100 * correct / total

print(f"\nTest Accuracy: {accuracy:.2f}%")

torch.save(model.state_dict(), "saved_models/ecg_model.pth")

print("Model saved successfully!")
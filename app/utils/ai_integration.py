import io
from collections import Counter
from typing import List

import torch
import torch.nn.functional as F

from PIL import Image as PILImage

from fastapi import UploadFile
from transformers import ViTForImageClassification, ViTImageProcessor

model_path = "custom_hand_gestures_model_v2_28june"
model = ViTForImageClassification.from_pretrained(model_path)
processor = ViTImageProcessor.from_pretrained(model_path)

label2id = model.config.label2id
id2label = model.config.id2label


def load_image(image_file: UploadFile):
    image_bytes = image_file.file.read()
    image = PILImage.open(io.BytesIO(image_bytes)).convert("RGB")
    return image


def predict(image: PILImage.Image):
    inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
    logits = outputs.logits
    probabilities = F.softmax(logits, dim=-1)
    predicted_class_idx = logits.argmax(-1).item()
    predicted_label = id2label[predicted_class_idx]
    predicted_probability = probabilities[0][predicted_class_idx].item()
    all_probabilities = {id2label[i]: prob.item() for i, prob in enumerate(probabilities[0])}
    return predicted_label, predicted_probability, all_probabilities


def classify_images_internal(gesture_names: str, images: List[UploadFile], strict: bool):
    result_array = gesture_names.split(',')
    results = []
    print(gesture_names)
    for image_file in images:
        image = load_image(image_file)
        label, prob, _ = predict(image)
        results.append(label)

    if strict:
        correct_count = sum(1 for x, y in zip(result_array, results) if x == y)
    else:
        result_counter = Counter(results)
        correct_count = 0
        for gesture in result_array:
            if result_counter[gesture] > 0:
                correct_count += 1
                result_counter[gesture] -= 1

    return {"correct_count": correct_count, "results": results}

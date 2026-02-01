import torch
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
from torch.nn.functional import softmax

emotion_labels = [
    "happy", "sad", "calm",
    "romantic", "energetic", "angry", "neutral"
]

tokenizer = DistilBertTokenizerFast.from_pretrained(
    "model/musicmitra_emotion_model"
)
model = DistilBertForSequenceClassification.from_pretrained(
    "model/musicmitra_emotion_model"
)

model.eval()

def predict_emotion(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
    probs = softmax(outputs.logits, dim=1).numpy()[0]
    return dict(zip(emotion_labels, probs.tolist()))

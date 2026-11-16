import pandas as pd

data = pd.read_csv("dataset/isl_dataset.csv")

print(data["label"].value_counts())
print("Total samples:", len(data))
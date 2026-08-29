import pandas as pd
df=pd.read_csv("data/crop_recommendation_dataset.csv")
def get_season(row):
    if row["Rainfall"]>200:
        return "Monsoon"
    elif row["Temperature"]>30:
        return "Summer"
    elif row["Temperature"]<20:
        return "Winter"
    else:
        return "Post Monsoon"
def water_level(row):

    if row["Rainfall"] > 250:
        return "High"

    elif row["Rainfall"] > 120:
        return "Medium"

    else:
        return "Low"
df["season"]=df.apply(get_season,axis=1) 
df["waterAvailability"] = df.apply(water_level, axis=1)   
df.to_csv("data/final_dataset.csv", index=False)

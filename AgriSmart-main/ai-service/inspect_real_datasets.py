import pandas as pd


def inspect(file, name):
    df = pd.read_csv(file)

    print("\n" + "=" * 50)
    print(name)
    print("=" * 50)

    print("\nSHAPE:")
    print(df.shape)

    print("\nCOLUMNS:")
    print(list(df.columns))

    print("\nFIRST 5 ROWS:")
    print(df.head().to_string(index=False))

    print("\nMISSING VALUES:")
    print(df.isnull().sum())

    print("\nUNIQUE COUNTS:")
    print(df.nunique())


inspect(
    "dataset/fertilizer_real.csv",
    "FERTILIZER"
)

inspect(
    "dataset/irrigation_real.csv",
    "IRRIGATION"
)
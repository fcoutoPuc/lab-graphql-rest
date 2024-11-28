import pandas as pd
import matplotlib.pyplot as plt

# Define file names
passo1_csv = "passo1_metrics.csv"
passo2_csv = "passo2_metrics.csv"

# Define the columns to compare
columns_to_compare = ["MedianTime", "AverageTime", "ResponseSize"]

# Function to read and combine data from both CSVs
def load_and_combine_data(passo1_csv, passo2_csv):
    passo1_data = pd.read_csv(passo1_csv)
    passo2_data = pd.read_csv(passo2_csv)
    combined_data = pd.concat([passo1_data, passo2_data], ignore_index=True)
    return combined_data

# Function to plot comparisons
def plot_comparisons(data, column, title, filename):
    apis = data["API"].unique()
    steps = data["Step"].unique()

    # Prepare data for plotting
    grouped_data = data.groupby(["Step", "API"])[column].mean().unstack()

    # Plot
    grouped_data.plot(kind="bar", figsize=(10, 6), colormap="viridis")
    plt.title(title)
    plt.ylabel(column)
    plt.xlabel("Step")
    plt.xticks(rotation=0)
    plt.legend(title="API", loc="best")
    plt.tight_layout()
    plt.savefig(filename)
    plt.show()

def main():
    # Load and combine data
    data = load_and_combine_data(passo1_csv, passo2_csv)

    # Generate graphs for each column
    for column in columns_to_compare:
        title = f"Comparison of {column} for REST vs GraphQL"
        filename = f"{column}_comparison.png"
        plot_comparisons(data, column, title, filename)
        print(f"Graph for {column} saved as {filename}")

if __name__ == "__main__":
    main()

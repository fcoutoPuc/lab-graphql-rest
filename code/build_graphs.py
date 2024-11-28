import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Define file names
passo1_csv = "passo1_metrics.csv"
passo2_csv = "passo2_metrics.csv"

# Define the columns to compare
columns_to_compare = ["MedianTime", "AverageTime", "ResponseSize"]

# Function to read data for a specific passo
def load_data(file_name):
    return pd.read_csv(file_name)

# Function to plot bar chart for Passo 1
def plot_bar_chart(data, column, title, filename):
    # Group data by API and compute the mean for the column
    grouped_data = data.groupby("API")[column].mean()

    # Create bar chart
    grouped_data.plot(kind="bar", figsize=(8, 6), color=["#1f77b4", "#ff7f0e"])
    plt.title(title)
    plt.ylabel(column)
    plt.xlabel("API")
    plt.xticks(rotation=0)
    plt.tight_layout()
    plt.savefig(filename)
    plt.show()

# Function to plot distribution chart for Passo 2
def plot_distribution_chart(data, column, title, filename):
    # Create the box plot
    plt.figure(figsize=(8, 6))
    sns.boxplot(data=data, x="API", y=column, palette="viridis")
    plt.title(title)
    plt.ylabel(column)
    plt.xlabel("API")
    plt.tight_layout()
    plt.savefig(filename)
    plt.show()

def main():
    # Load data for both steps
    passo1_data = load_data(passo1_csv)
    passo2_data = load_data(passo2_csv)

    # Passo 1: Generate bar charts
    for column in columns_to_compare:
        title = f"Passo 1 - Bar Chart of {column} for REST vs GraphQL"
        filename = f"Passo_1_{column}_bar_chart.png"
        plot_bar_chart(passo1_data, column, title, filename)
        print(f"Passo 1 - Bar chart for {column} saved as {filename}")

    # Passo 2: Generate distribution charts
    for column in columns_to_compare:
        title = f"Passo 2 - Distribution of {column} for REST vs GraphQL"
        filename = f"Passo_2_{column}_distribution_chart.png"
        plot_distribution_chart(passo2_data, column, title, filename)
        print(f"Passo 2 - Distribution chart for {column} saved as {filename}")

if __name__ == "__main__":
    main()

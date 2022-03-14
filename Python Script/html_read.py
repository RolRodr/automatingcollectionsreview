__author__ = 'Rolando Rodriguez, rolando.rodriguez@unc.edu, Onyen = rolando'


from bs4 import BeautifulSoup
import re
import pandas as pd

file = input("Type in file name: ")
string = open(file)

ex_csv = input("Is there an existing csv file to save results in? (y\\n)")

if ex_csv == 'y':
    csv_name = input("Type in existing CSV file name:")
else:
    csv_name = input("Type in new CSV file name:")

soup = BeautifulSoup(string, "html.parser")

titles = []
authors = []


for item in soup.findAll('div'):
    try:
        if item['class'][0] == 'truncatedResultsTitle':
            titles.append(item.string.strip())
    except:
        pass

for item in soup.findAll("span"):
    try:
        if (str(item['class']) == "['titleAuthorETC']") and (re.match(r"[0-9 ]", item.string.strip()) == None):
            authors.append(item.string.strip())
    except:
        pass


d = {'Titles': titles, 'Authors': authors}
df = pd.DataFrame(data=d)

if ex_csv == 'y':
    ex_df = pd.read_csv(csv_name)
    new_titles = ex_df['Titles'].append(df['Titles'])
    new_authors = ex_df['Authors'].append(df['Authors'])
    new_df = pd.DataFrame(data={'Titles': new_titles, 'Authors': new_authors })
    #new_df = pd.concat(ex_def, df)
    #print(new_df)
    ex_df.to_csv(csv_name, index=False)
else:
    df.to_csv(csv_name, index=False)

if open(csv_name):
    print('.')
    print('.')
    print('.')
    print("CSV has been saved in your current directory.")

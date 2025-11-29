SETUP_FILE = 'setup.py'
PROVIDER_NAME = 'example'
PROVIDER_PATH = 'example.provider:Provider'
OPERATOR_PATH = 'number_replacer.py'
MODIFIED = False
# this will be true if it is already modified automatically

# DESCR
# run this file, in folder in which provider and operator code are, 
# it will create new .py file, which you move into folder where you test and run it,
# it is installer,  it will automatically modify setup
# and also creates the folder and the .py in it


# those first 3  lines will change depending on name of our operator file, and then ame of operators

# we can change them by hand,
# but i will make script to make this automatically

# this is the script

import ast
import json
import astor

import os
#print(os.getcwd())

import sys





# copy text from from both .py files, later we can append it to ur code
def get_file_text():
    directory = os.path.dirname(os.path.realpath(__file__))  # Current folder
    operator_files = find_files_with_keyword(directory, "parso")
    # no parso in provider, this should return file path of operator.py , like mutate_string.py

    provider_files = find_files_with_keyword(directory, "class Provider")
    #no class provider in operator
    ar = list()
    ar = ["\n", "§"  , str(operator_files[0])]
    with open(operator_files[0], "r") as f:
        lines = f.readlines()
        ar = ar + lines
    
    ar = ar + ["\n","§", str(operator_files[0])]
    with open(operator_files[0], "r") as f:
        lines = f.readlines()
        ar = ar + lines
    
    return ar

def get_operators_dict():
    directory = os.path.dirname(os.path.realpath(__file__))  # Current folder
    operator_files = find_files_with_keyword(directory, "parso")
    rd = read_python_file_to_dict(operator_files[0])
    return rd
def get_provider_dict():
    directory = os.path.dirname(os.path.realpath(__file__))  # Current folder
    provider_files = find_files_with_keyword(directory, "class Provider")
    rd = read_python_file_to_dict(provider_files[0])
    return rd


def read_python_file_to_dict(file_path):
    # Extract the file name without the extension
    file_name = os.path.splitext(os.path.basename(file_path))[0]
    
    # Open the file and read its lines
    with open(file_path, 'r', encoding='utf-8') as file:
        lines = file.readlines()
    
    # Create a dictionary with the file name as the key and lines as the value
    file_dict = {file_name: lines}
    
    return file_dict


 # this changes setup, we should create folder and write .py first


# this modifies the setup.py

#if MODIFIED == True:
# not needed,         sys.exit()  


def modify_setup():
    # mostly generated

    # this should work almst always,
    # only problem is that it deletes comments
    # ? TODO maybe make option to backup old setup.py



    NEW_PROVIDER_STRING = f'{PROVIDER_NAME} = {PROVIDER_PATH}'

    # if there is no setup.py, when creating, it will write lines from this list into it 
    DEFAULT_LINES_LIST = [
        "from setuptools import setup",

        "setup(",
        "entry_points={",
        " 'cosmic_ray.operator_providers': [ ",
        #"'" + PROVIDER_NAME + " = " +   PROVIDER_PATH + "'",
        NEW_PROVIDER_STRING,
        "]",
        "    })"

    ]




    # Step 1: Read setup.py
    # if does not exist, create it, write default lines and exit
    if os.path.exists(SETUP_FILE):
        with open(SETUP_FILE, 'r', encoding='utf-8') as f:
            setup_src = f.read()
    else:
        with open(SETUP_FILE, 'w', encoding='utf-8') as f:
            print("creating  setup from zero")
            for item in DEFAULT_LINES_LIST:
                f.write(f"{item}\n")
            sys.exit()  # stops the script
            # no need to continue, setup.py looks exactly how we want it to



    # Step 2: Parse the file,
    # try and except are for when setup.py is somehow broken
    try:
        tree = ast.parse(setup_src)
    except (SyntaxError, FileNotFoundError):
        print("setup.py is empty or invalid; starting from scratch.")
        tree = ast.Module(body=[], type_ignores=[])


    # Step 3: Find setup() call
    setup_call = None
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and getattr(node.func, 'id', '') == 'setup':
            setup_call = node
            break
    if not setup_call:
        #raise RuntimeError("No setup() call found in setup.py")
        print ("No setup() call found in setup.py, this should not happen, will write from zero unless setup.py exists")
        if not os.path.exists(SETUP_FILE):
            print("creating new ")
            with open(SETUP_FILE, 'w') as f:
                pass  # Create empty file
        with open(SETUP_FILE, 'a', encoding='utf-8') as f:
            for item in DEFAULT_LINES_LIST:
                f.write(f"{item}\n")
            sys.exit()  # stops the script

    # Step 4: Find or create entry_points (only create if missing)
    entry_points_arg = None
    for kw in setup_call.keywords:
        if kw.arg == 'entry_points':
            entry_points_arg = kw.value
            break

    if entry_points_arg is None:
        # Only create entry_points dict if it doesn't exist
        entry_points_arg = ast.Dict(keys=[], values=[])
        setup_call.keywords.append(ast.keyword(arg='entry_points', value=entry_points_arg))

    # Step 5: Find or create 'cosmic_ray.operator_providers'
    provider_key_idx = None
    for idx, k in enumerate(entry_points_arg.keys):
        if isinstance(k, ast.Constant) and k.value == 'cosmic_ray.operator_providers':
            provider_key_idx = idx
            break

    if provider_key_idx is not None:
        # Only append if provider is not already listed
        provider_list = entry_points_arg.values[provider_key_idx].elts
        if not any(isinstance(e, ast.Constant) and e.value == NEW_PROVIDER_STRING for e in provider_list):
            provider_list.append(ast.Constant(value=NEW_PROVIDER_STRING))
    else:
        # Only create new key if it doesn't exist
        entry_points_arg.keys.append(ast.Constant(value='cosmic_ray.operator_providers'))
        entry_points_arg.values.append(ast.List(elts=[ast.Constant(value=NEW_PROVIDER_STRING)], ctx=ast.Load()))

    # Step 6: Write back only if something changed
    new_src = astor.to_source(tree)
    if new_src != setup_src:
        with open(SETUP_FILE, 'w', encoding='utf-8') as f:
            f.write(new_src)
        print(f"Provider '{PROVIDER_NAME}' added to setup.py.")
    else:
        print("No changes needed; provider already exists.")




# to find which files are for operator, which for api
def find_files_with_keyword(directory, keyword):
    # List to store the paths of files that contain the keyword
    matching_files = []
    
    # Loop through all files in the specified directory
    for filename in os.listdir(directory):
        # Check if the file is a Python file
        if filename.endswith(".py"):
            file_path = os.path.join(directory, filename)
            
            # Open and read the file
            with open(file_path, 'r', encoding='utf-8') as file:
                file_content = file.read()
                
                # Check if the keyword is in the file
                if keyword in file_content:
                    #matching_files.append(file_path)
                    matching_files.append(filename)
    
    # should remove the current .py file from this 
# because it migt always contain the keywords
    return matching_files






def generate_installer():
    # read this .py file
    with open(__file__, "r") as f:
        old_lines = f.readlines()
    # remove first 4 lines, easier than rewriting it
    old_lines = old_lines[5:]
    
    new_lines = []
    new_lines.append("SETUP_FILE = 'setup.py'")
    # get name of folder in which we run script
    script_path = os.path.abspath(__file__)
    folder_name = os.path.basename(os.path.dirname(script_path))
    new_lines.append(f"PROVIDER_NAME = '{folder_name}'")

    # now name of provider, it should always be ,,folder" + ,,same thing always"
    s = " PROVIDER_PATH = '" +  folder_name + ".provider:Provider"
    s = f"PROVIDER_PATH = '{folder_name}.provider:Provider'"
    new_lines.append(s)

    # make MODIFIED = True
    new_lines.append("MODIFIED = True")

    #this will be name of the file with operaotrs
    script_folder = os.path.dirname(os.path.abspath(__file__))

    operator_file = find_files_with_keyword(script_folder, "parso")
    new_lines.append(f"OPERATOR_PATH = '{operator_file[0]}'")


# fild what .py we need to write
    #end_lines = []
    #end_lines.append("UY63HZ1OD4D75YP6LI9QXYZNATVZUW")

    #xr = get_file_text()
    #end_lines.append(xr)



    # write the new file
    with open(f"install_{PROVIDER_NAME}_.py", "w") as f:
        all_lines = new_lines + old_lines #+ end_lines
        
        #f.writelines(all_lines)
        for item in all_lines:
            f.write(str(item) + '\n')  # Write each item followed by a newline
    print("created installer but still need to write dicts at the end")    
    # write the two dictionaries
   

    dict1 = get_operators_dict()
    dict2 = get_provider_dict()
    #dict1.update(dict2)

    # write this dictionary into end of folder 
        #f.writelines(all_lines)
    with open(f"install_{PROVIDER_NAME}_.py", "a") as f:
        f.write(str("#UY63HZ1OD4D75YP6LI9QXYZNATVZUW") + '\n')  # Write each item followed by a newline

    with open(f"install_{PROVIDER_NAME}_.py", 'a', encoding='utf-8') as file:
        #json.dump(dict1, file, indent=4)
        file.write(str(dict1))
        file.write("\n")
        file.write(str(dict2))

    sys.exit()  # stops the script



def create_folder(folder_name = PROVIDER_NAME ):
    #os.mkdir("PROVIDER_NAME")
    script_dir = os.path.dirname(os.path.realpath(__file__))
    new_folder_path = os.path.join(script_dir, folder_name)
    os.makedirs(new_folder_path, exist_ok=True)


# last line of this file should always be dictionary with 
def read_last_into_dict():
    
    def read_last_line_of_current_script():
        try:
            current_script_path = __file__
            with open(current_script_path, 'r', encoding='utf-8') as file:
                lines = file.readlines()
            if not lines:
                raise ValueError("The script file is empty.")
            # Get the last line, strip extra spaces or newlines
            last_line = lines[-1].strip()
            last_line = str(last_line)
            return last_line
        except Exception as e:
            print(f"Error reading the last line: {e}")
            return None
    s = read_last_line_of_current_script()
    def str_to_dict(input_str):
        try:
            # Safely evaluate the string as a Python dictionary
            #loaded_dict = ast.literal_eval(x)           
            #input_str = x
            input_str = str (input_str)
            input_str = input_str.replace("\n","")
            loaded_dict = ast.literal_eval(input_str) 
            return loaded_dict
        except Exception as e:
            print(f"Error converting the last line to a dictionary: {e}")
            return None
    dit = str_to_dict(s)
    return dit


def create_files(file_dict, folder_path = PROVIDER_NAME):
   # Ensure the folder exists, create it if necessary
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
    for file_name, lines in file_dict.items():
        try:
            # Ensure the filename ends with '.py'
            if not file_name.endswith('.py'):
                file_name += '.py'
            # Open the file in write mode
            file_path = os.path.join(folder_path, file_name)

            with open(file_path, 'w', encoding='utf-8') as file:
                # Write each line to the file
                file.writelines([line + '\n' for line in lines])  # Add newline after each line
            
            print(f"Files '{file_path}' created successfully.")
        
        except Exception as e:
            print(f"Error creating file '{file_path}': {e}")
    


if MODIFIED == False:
    generate_installer()
else:
    modify_setup()
    #create_folder()
    xd = read_last_into_dict()
    create_files(xd)
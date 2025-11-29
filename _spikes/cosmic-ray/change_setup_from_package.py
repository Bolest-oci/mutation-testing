print("start")
# this  will be placed in folder of our custom mutator and its provider

# if you set AUTO to true it will automaticaly finds the CAPITAL values from .py files in folder
# if you set it to False, you can manually create this setup modifier specific for your mutators,
#  that you should distribute with operators
# 
AUTO = True

import os
script_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(script_dir)
print(script_dir,parent_dir)
SETUP_FILE = parent_dir + '\setup.py'
print(script_dir,parent_dir,SETUP_FILE)

# for now rewrite this manually and 
PROVIDER_NAME = 'example'
PROVIDER_PATH = 'example.provider:Provider'
OPERATOR_PATH = 'number_replacer.py'
NEW_PROVIDER_STRING = f'{PROVIDER_NAME} = {PROVIDER_PATH}'

# this will be true if it is already modified automatically

    # if there is no setup.py, when creating, it will write lines from this list into it 
DEFAULT_LINES_LIST = [
        "from setuptools import setup",
        "setup(",
        "entry_points={",
        " 'cosmic_ray.operator_providers': [ ",
        NEW_PROVIDER_STRING,
        "]",
        "    })"
    ]

# DESCR
# run this file, in folder in which provider and operator code are, 
# it will ask for name of 


# those first 3  lines will change depending on name of our operator file, and then ame of operators

# we can change them by hand,
# but i will make script to make this automatically

# this is the script

import ast
import astor

#print(os.getcwd())
import sys
import shutil


# this modifies the setup.py

#if MODIFIED == True:
# not needed,         sys.exit()  


# will just modify setup
def modify_setup():
    # mostly generated
    # this should work almst always,
    # only problem is that it deletes comments
    # ? TODO maybe make option to backup old setup.py



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

    if (any(NEW_PROVIDER_STRING in line for line in open(SETUP_FILE))) :
        print("already_modified")
        sys.exit()
    # if there is already our operators imported, end this

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
        #if (any('setup' in line for line in open(SETUP_FILE))) == False:
            #if there is word setup in the setup file, dont write anew
        if True:
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
            print(new_src)
            # remove duplicate
            nw = f"{NEW_PROVIDER_STRING}"
            #nw = f"'{nw}'"
            nw = f'"{nw}"'
            nw = f', {nw}'
            print(nw)
            new_src.replace(nw,"")
            print(new_src)

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

    matching_files = [file for file in matching_files if file != os.path.basename(__file__)]
    return matching_files




def create_folder(folder_name = PROVIDER_NAME ):
    #os.mkdir("PROVIDER_NAME")
    script_dir = os.path.dirname(os.path.realpath(__file__))
    new_folder_path = os.path.join(script_dir, folder_name)
    os.makedirs(new_folder_path, exist_ok=True)

def remove_doublestrings(file_path = SETUP_FILE):
    with open(file_path, 'r') as file:
        content = file.read()
    content = content.replace(f'\'"', "'")
    content = content.replace(f"'\"", "'")
    content = content.replace(f'"\'', "'")

    with open(file_path, 'w') as file:
        file.write(content)
    

# if __name__ == "__main__":
if 0 == 0:
    # copied, now auto modify setup
    if AUTO == True:
        print("auto mdify file")
        SETUP_FILE = parent_dir + '\setup.py'
        print(SETUP_FILE)
        #SETUP_FILE = 'setup.py'
        script_dir = os.path.dirname(os.path.realpath(__file__))
        PROVIDER_NAME =  os.path.basename(script_dir)
        PROVIDER_PATH = f"{PROVIDER_NAME}.provider:Provider'"

        operator_py =  find_files_with_keyword(script_dir, "parso")
        OPERATOR_PATH = operator_py[0]

        NEW_PROVIDER_STRING = f"'{PROVIDER_NAME} = {PROVIDER_PATH}"
        
        DEFAULT_LINES_LIST = [
        "from setuptools import setup",
        "setup(",
        "entry_points={",
        " 'cosmic_ray.operator_providers': [ ",
        NEW_PROVIDER_STRING,
        "]",
        "    })"
    ]
    
        modify_setup()
        remove_doublestrings()
    else:
        # this will use the values manually written on top
        modify_setup()
        remove_doublestrings()


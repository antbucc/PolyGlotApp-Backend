import os
import xmltodict
import xml.etree.ElementTree as et
import json
xml_doc_path = os.path.abspath(r"./example.xml")

xml_tree = et.parse(xml_doc_path)

root = xml_tree.getroot()
#set encoding to and method proper
to_string  = et.tostring(root, encoding='UTF-8', method='xml')

xml_to_dict = xmltodict.parse(to_string)

with open("json_data.json", "w",) as json_file:
    json.dump(xml_to_dict, json_file, indent = 2)
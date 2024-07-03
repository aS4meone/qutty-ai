from googletrans import Translator
from langchain_huggingface import HuggingFaceEndpoint

huggingfacehub_api_token = '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'

llm = HuggingFaceEndpoint(repo_id='meta-llama/Meta-Llama-3-8B-Instruct',
                          huggingfacehub_api_token=huggingfacehub_api_token)


def to_llama(diagnosis, name):
    input = (
        f'You are a medical specialist in dementia. Your job is to give a patient with diagnosis {diagnosis} recommendations for health and memory training, and to recommend seeing a specialist. ONLY 6 RECOMMENDATIONS. Dont write anything except recommendations. The name of a patient is - {name}')
    output = llm.invoke(input)
    return output


def translate_text(text, dest_language='ru'):
    translator = Translator()
    translation = translator.translate(text, dest=dest_language)
    return translation.text


def generate_recommendations(diagnosis, name):
    print(diagnosis)
    text = to_llama(diagnosis, name)
    print(text)
    return translate_text(text)

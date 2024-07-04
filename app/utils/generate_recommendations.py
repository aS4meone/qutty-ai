from langchain_huggingface import HuggingFaceEndpoint

huggingfacehub_api_token = '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'

llm = HuggingFaceEndpoint(repo_id='meta-llama/Meta-Llama-3-8B-Instruct',
                          huggingfacehub_api_token=huggingfacehub_api_token)


def to_llama(diagnosis, name):
    input = (
        f'Ты - медицинский специалист по деменции. Твоя задача - дать пациенту с диагнозом {diagnosis} рекомендации по оздоровлению и тренировке памяти, а также порекомендовать обратиться к специалисту. ВСЕГО 6 РЕКОМЕНДАЦИЙ. Не пишешь ничего, кроме рекомендаций. Имя пациента - {name}')
    output = llm.invoke(input)
    return output


def generate_recommendations(diagnosis, name):
    print(diagnosis)
    text = to_llama(diagnosis, name)
    print(text)
    return text

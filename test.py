import re
import sys
import requests
import time

# Obtém o nome da live a partir do primeiro argumento da linha de comando
host = sys.argv[1]
live_name = sys.argv[2]

# Endpoint que retorna o arquivo de texto com a lista de m3u8
endpoint = f"http://{host}/channel/{live_name}"

while True:
    # Faz a requisição HTTP para obter o arquivo de texto com a lista de m3u8
    response = requests.get(endpoint)

    # Encontra os links m3u8 dentro do arquivo de texto usando expressões regulares
    m3u8_links = re.findall(r"(http.*?\.m3u8)", response.text)

    if len(m3u8_links) == 0:
        raise Exception("Erro: nenhum link m3u8 encontrado.")

    # Faz uma requisição HTTP para o primeiro link m3u8 encontrado
    first_m3u8_link = m3u8_links[0]
    response = requests.get(first_m3u8_link)

    print("Testando proxy...")
    
    # Verifica se a resposta contém a string "Amazon"
    if "stitched" in response.text:
        raise Exception("Erro: o proxy não está funcionando corretamente.")
    
    time.sleep(1)  # pausa por 1 segundo antes de reiniciar o loop

import json
import os
import urllib.request
import urllib.error


def handler(event: dict, context) -> dict:
    '''
    Business: ИИ-помощник Aura — принимает историю чата и возвращает ответ нейросети.
    Args: event с httpMethod, body (messages, model); context с request_id.
    Returns: HTTP-ответ с текстом ответа ассистента.
    '''
    method = event.get('httpMethod', 'GET')

    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
        }

    api_key = os.environ.get('OPENAI_API_KEY')
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'API key not configured'}),
        }

    body_data = json.loads(event.get('body') or '{}')
    user_messages = body_data.get('messages', [])
    model_id = body_data.get('model', 'nova')

    model_map = {
        'nova': 'gpt-4o-mini',
        'flux': 'gpt-4o',
        'turbo': 'gpt-4o-mini',
    }
    openai_model = model_map.get(model_id, 'gpt-4o-mini')

    system_prompt = {
        'role': 'system',
        'content': 'Ты Aura — дружелюбный персональный ИИ-помощник. Отвечай ясно, по делу и на русском языке. Помогай с любыми задачами.',
    }

    chat_messages = [system_prompt]
    for m in user_messages:
        role = 'assistant' if m.get('role') == 'assistant' else 'user'
        chat_messages.append({'role': role, 'content': str(m.get('text', ''))})

    payload = json.dumps({
        'model': openai_model,
        'messages': chat_messages,
        'temperature': 0.7,
        'max_tokens': 1000,
    }).encode('utf-8')

    req = urllib.request.Request(
        'https://api.openai.com/v1/chat/completions',
        data=payload,
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
        },
        method='POST',
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read().decode('utf-8'))
        reply = result['choices'][0]['message']['content']
    except urllib.error.HTTPError as e:
        err_text = e.read().decode('utf-8')
        return {
            'statusCode': 502,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'AI provider error', 'details': err_text}),
        }

    return {
        'statusCode': 200,
        'headers': {**cors_headers, 'Content-Type': 'application/json'},
        'body': json.dumps({'reply': reply}, ensure_ascii=False),
    }

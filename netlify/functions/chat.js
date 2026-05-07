exports.handler = async (event, context) => {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse el body - IMPORTANTE: el frontend envía "message" no "messages"
    const { message, apiKey } = JSON.parse(event.body);

    // Validar que tengamos los datos necesarios
    if (!apiKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'API key required' })
      };
    }

    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Message required' })
      };
    }

    // Llamar a Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        messages: [{ role: 'user', content: message }]
      })
    });

    const data = await response.json();

    // Si Anthropic responde con error, pasarlo al frontend
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: data.error?.message || 'API error',
          details: data
        })
      };
    }

    // Respuesta exitosa
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};

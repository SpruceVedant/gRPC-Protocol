public class OpenAIGPT4Callout {
    
    public static final String OPENAI_API_KEY = ''; 

 
    public static String sendPromptToGPT4(String promptText) {
        try {
           
            HttpRequest req = new HttpRequest();
            req.setEndpoint('https://api.openai.com/v1/chat/completions'); 
            req.setMethod('POST');
            req.setHeader('Authorization', 'Bearer ' + OPENAI_API_KEY);
            req.setHeader('Content-Type', 'application/json');
            
         
            Map<String, Object> body = new Map<String, Object>{
                'model' => 'gpt-4o-mini', 
                'messages' => new List<Map<String, Object>>{
                    new Map<String, Object>{'role' => 'user', 'content' => promptText}
                },
                'max_tokens' => 150, 
                'temperature' => 0.7
            };

            String requestBody = JSON.serialize(body);
            req.setBody(requestBody);
            
    
            Http http = new Http();
            HttpResponse res = http.send(req);
            
            
            if (res.getStatusCode() == 200) {
                Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
                List<Object> choices = (List<Object>) responseMap.get('choices');
                
                if (!choices.isEmpty()) {
                    Map<String, Object> choice = (Map<String, Object>) choices[0];
                    String generatedText = (String) ((Map<String, Object>) choice.get('message')).get('content');
                    System.debug('Generated Text from GPT-4: ' + generatedText);
                    
                    return generatedText;
                }
            } else {
                System.debug('Failed to get response from GPT-4. Status: ' + res.getStatusCode() + ', Response: ' + res.getBody());
                return null;
            }

        } catch (Exception e) {
           
            System.debug('Error occurred: ' + e.getMessage());
            return null;
        }
    }
}

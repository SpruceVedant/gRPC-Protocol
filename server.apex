public class OpenAIIntegrationService {
    
    private static final String OPENAI_API_URL = 'https://openai.com/v1/completions';
    private static final String OPENAI_API_KEY = '';


    public static String callOpenAIAPI(String queryText) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        request.setEndpoint(OPENAI_API_URL);
        request.setMethod('POST');
        
   
        request.setHeader('Authorization', 'Bearer ' + OPENAI_API_KEY);
        request.setHeader('Content-Type', 'application/json');
        
        
        String payload = JSON.serialize(new Map<String, Object>{
            'model' => 'gpt-4o',  
            'prompt' => queryText,
            'max_tokens' => 150 
        });
        request.setBody(payload);
        
        try {
           
            HttpResponse response = http.send(request);
            
           
            if (response.getStatusCode() == 200) {
                Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
                List<Object> choices = (List<Object>) responseMap.get('choices');
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> choice = (Map<String, Object>) choices[0];
                    return (String) choice.get('text'); 
                }
            } else {
                System.debug('Failed to call OpenAI API: ' + response.getStatus());
                System.debug('Response: ' + response.getBody());
            }
        } catch (Exception e) {
            System.debug('Error calling OpenAI API: ' + e.getMessage());
        }
        
        return null;
    }


    public static void exampleQueryFromRecord(Id recordId) {
        
        My_Object__c record = [SELECT Query_Text_Field__c FROM My_Object__c WHERE Id = :recordId LIMIT 1];
        
        
        String responseText = callOpenAIAPI(record.Query_Text_Field__c);
        
        if (responseText != null) {
            System.debug('OpenAI Response: ' + responseText);
         
            record.Response_Text_Field__c = responseText;
            update record;
        }
    }
}

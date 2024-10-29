public class GrokAICallout {
    

    public static String sendAccountToGrokAI(Id accountId) {
    
        Account acc = [SELECT Id, Name, Industry, AnnualRevenue FROM Account WHERE Id = :accountId LIMIT 1];
        
       
        String requestBody = JSON.serializePretty(new Map<String, Object>{
            'accountId' => acc.Id,
            'accountName' => acc.Name,
            'industry' => acc.Industry,
            'annualRevenue' => acc.AnnualRevenue
        });

        try {
            
            HttpRequest req = new HttpRequest();
            req.setEndpoint('https://api.x.ai/v1');
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setBody(requestBody);

          
            Http http = new Http();
            HttpResponse res = http.send(req);

        
            if (res.getStatusCode() == 200) {
              
                String responseBody = res.getBody();
                System.debug('Response from Grok AI: ' + responseBody);
                
             
                return responseBody.code; 
            } else {
             
                System.debug('Failed to get response. Status: ' + res.getStatusCode() + ', Response: ' + res.getBody());
                return null;
            }

        } catch (Exception e) {
            
            System.debug('Error occurred: ' + e.getMessage());
            return null;
        }
    }
}

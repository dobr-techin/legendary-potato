public with sharing class AccountListController{

	@AuraEnabled(cacheable = false)
	public static List<Account> getAccountList(){
    
        return [SELECT Id, Name, Rating
		        FROM Account
				LIMIT 20
		];
	}
}
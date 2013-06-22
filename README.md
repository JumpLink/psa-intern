My result of this tutorial: http://www.youtube.com/watch?v=hqAyiqUs93c

You can find the original result on: https://github.com/davemo/end-to-end-with-angularjs


My changes:
* Use NodeJS Expressjs framework instead of Laravel 4
* Use Bootstrap Css instead of foundation.min.css
* and a few other little things


Testdaten erzeugen

r.db('psa_internal').tableCreate('users', {primaryKey: 'email'})

r.db('psa_internal').table('users').insert({email: 'jumplink@gmail.com', name: 'JumpLink', salt: "rSZxs8tfvFg/sa4PHQW3uq2lh8GOE3N34l288IIF5uRMJofYDhYqBFcyBO6YFDPzclNnX86e8KpU3+3UrleWLRR9fkhOyQEhGaeTyArbmoTS3SnP8Bu1Q3InO/yAvEjyGWJkMEbJepL0vQCNtfHWx6+hpAbE82yztJkzAdN1pjg=", hash: "cUwK/2oI4mbFXQxY5Yg2EaFBuk+s62edYOs42foKnTAzGzO8vVtHKBEDcZWOdE7Nc1YWmlIn/iVXWiBwB/iGrfz6WpbmqKtFT5AeuNmttRNK/7q6QORkkoKtHiI0/dVLBu9AlNu/QNEJ0UXsjtmDv1z4flTsfHwf9WNd7Qra7O4="}); // passwort is 123456 

r.db('psa_internal').table('users').insert({email: 'cp@rimtest.de', name: 'Pfeil', salt: "rSZxs8tfvFg/sa4PHQW3uq2lh8GOE3N34l288IIF5uRMJofYDhYqBFcyBO6YFDPzclNnX86e8KpU3+3UrleWLRR9fkhOyQEhGaeTyArbmoTS3SnP8Bu1Q3InO/yAvEjyGWJkMEbJepL0vQCNtfHWx6+hpAbE82yztJkzAdN1pjg=", hash: "cUwK/2oI4mbFXQxY5Yg2EaFBuk+s62edYOs42foKnTAzGzO8vVtHKBEDcZWOdE7Nc1YWmlIn/iVXWiBwB/iGrfz6WpbmqKtFT5AeuNmttRNK/7q6QORkkoKtHiI0/dVLBu9AlNu/QNEJ0UXsjtmDv1z4flTsfHwf9WNd7Qra7O4="}); // passwort is 123456 

r.db('psa_internal').table('messages').insert({ from: 'jumplink@gmail.com', timestamp: '2013-06-22T18:52:22.776Z', message: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc.' });

r.db('psa_internal').table('messages').insert({ from: 'jumplink@gmail.com', timestamp: '2013-06-22T18:52:22.776Z', message: 'Ich fahre heute in den Urlaub' });

r.db('psa_internal').table('messages').insert({ from: 'cp@rimtest.de', timestamp: '2013-06-22T18:52:22.776Z', message: 'Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können. Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können. Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht.' });
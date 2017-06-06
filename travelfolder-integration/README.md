# Travelfolder Integration

package zur integration in RocketChat, zur Installation siehe README im übergeordneten Ordner
zu installierende npm-Pakete:
```
jwt-decode
jsownwebtoken
dynamodb-marshaler
uuid4
auth0-js
```

zu installierende meteor-Pakete:

`mrt:fancybox`

## zur Implementation

+ in `server/methods/` sind die serverseitigen  methods, die mit der travelfolder-api interagieren
+ in `client/views/app/tabbar` sind die templates und der dazugehörige js-code. Da ein paar Komponenten der RC-UI auch geändert werden sollten, wurde mit MutationObservern gearbeitet, um eine Änderung des RC-Codes zu verhindern (was zum Teil auch das ursprünlgiche redlink-upgrade verunmöglichte).
+ die Folder-struktur entspricht der der ursprünglichen redlink-pakete (und enthält auch noch zum Teil Code-Fragmente)
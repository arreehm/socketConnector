# socketConnector
Connect the sockets, and has bug in it.

First, you run `a.js` and `b.js`, then you launch `connectorServer.js`

Then it does:
```
undefined:1
{"context":"test","data":"Send from B"}"Whatever"
                                       ^

SyntaxError: Unexpected string in JSON at position 39
```
Which is unexpected, because those two things ware send in different `socket.writes`.

Or is it working as expected? I already implemented <EOT> between there, so it works, but IMO, every socket.write should trigger separate onData.


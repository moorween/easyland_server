kill -9 `pgrep -f "ssh -L"`

ssh  -L 23306:moorween@krucorp.ru:3306 -N \
 moorween@localhost

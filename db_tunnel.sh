kill -9 `pgrep -f "ssh -L"`
ssh moorween@krucorp.ru -L 23306:127.0.0.1:3306 -N

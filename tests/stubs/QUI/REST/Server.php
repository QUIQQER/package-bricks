<?php

namespace QUI\REST;

if (!class_exists(Server::class)) {
    class Server
    {
        public function getSlim(): SlimApplication
        {
            return new SlimApplication();
        }
    }
}

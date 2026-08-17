<?php

namespace Psr\Http\Message;

if (!interface_exists(ServerRequestInterface::class)) {
    interface ServerRequestInterface
    {
        /**
         * @return array<string, mixed>
         */
        public function getQueryParams(): array;

        public function getParsedBody(): mixed;
    }
}

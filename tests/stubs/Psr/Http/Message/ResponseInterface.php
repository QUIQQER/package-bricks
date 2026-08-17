<?php

namespace Psr\Http\Message;

if (!interface_exists(ResponseInterface::class)) {
    interface ResponseInterface
    {
        public function withStatus(int $code, string $reasonPhrase = ''): ResponseInterface;

        public function withHeader(string $name, mixed $value): ResponseInterface;

        public function getBody(): StreamInterface;
    }
}

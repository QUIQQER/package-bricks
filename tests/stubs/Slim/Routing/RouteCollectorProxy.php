<?php

namespace Slim\Routing;

if (!class_exists(RouteCollectorProxy::class)) {
    class RouteCollectorProxy
    {
        public function post(string $pattern, callable $callable): void
        {
        }

        public function get(string $pattern, callable $callable): void
        {
        }

        public function patch(string $pattern, callable $callable): void
        {
        }

        public function delete(string $pattern, callable $callable): void
        {
        }

        public function put(string $pattern, callable $callable): void
        {
        }
    }
}

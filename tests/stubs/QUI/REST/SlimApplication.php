<?php

namespace QUI\REST;

if (!class_exists(SlimApplication::class)) {
    class SlimApplication
    {
        public function group(string $pattern, callable $callable): void
        {
        }
    }
}

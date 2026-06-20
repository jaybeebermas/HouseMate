<?php

$navigationFiles = glob(__DIR__ . '/navigation/*.php') ?: [];
sort($navigationFiles);

$navigation = [];

foreach ($navigationFiles as $navigationFile) {
    $section = require $navigationFile;

    if (! is_array($section) || $section === []) {
        continue;
    }

    $isSequential = array_keys($section) === range(0, count($section) - 1);

    if ($isSequential) {
        foreach ($section as $item) {
            if (is_array($item)) {
                $navigation[] = $item;
            }
        }
        continue;
    }

    // Support files that return a single navigation item object.
    $navigation[] = $section;
}

return $navigation;

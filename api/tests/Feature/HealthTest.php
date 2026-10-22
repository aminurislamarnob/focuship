<?php

it('reports healthy with JSON', function () {
    $this->getJson('/health')
        ->assertOk()
        ->assertExactJson(['status' => 'ok']);
});

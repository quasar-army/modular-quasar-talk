<?php

namespace App\Http\Controllers\Api;

use App\Models\Todo;
use Orion\Concerns\DisableAuthorization;
use Orion\Http\Controllers\Controller;

class TodosController extends Controller
{
    use DisableAuthorization;

    protected $model = Todo::class;
}

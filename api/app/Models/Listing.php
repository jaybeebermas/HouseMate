<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Listing extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category',
        'price',
        'details',
        'latitude',
        'longitude',
        'address',
        'images',
        'cover_image',
        'rating',
        'reviews_count',
    ];

    protected $casts = [
        'images' => 'array',
        'price' => 'float',
        'latitude' => 'float',
        'longitude' => 'float',
        'rating' => 'float',
        'reviews_count' => 'integer',
    ];

    public function getRatingAttribute(?float $value): float
    {
        if (is_null($value)) {
            return (float) (4.5 + ($this->id % 5) * 0.1);
        }
        return (float) $value;
    }

    public function getReviewsCountAttribute(?int $value): int
    {
        if (is_null($value)) {
            return 5 + ($this->id % 15) * 3;
        }
        return (int) $value;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

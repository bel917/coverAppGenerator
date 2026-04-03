<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }}</title>
    <style>
        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #f5f7fb;
            color: #1f2937;
        }
        .wrap {
            max-width: 760px;
            margin: 48px auto;
            padding: 24px;
        }
        .card {
            background: #ffffff;
            border: 1px solid #dbe3ef;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
        }
        h1 {
            margin-top: 0;
            font-size: 32px;
        }
        p {
            line-height: 1.6;
        }
        code, a {
            word-break: break-word;
        }
        a {
            color: #2563eb;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        .label {
            font-weight: 700;
            display: block;
            margin-top: 16px;
            margin-bottom: 4px;
        }
    </style>
</head>
<body>
    <div class="wrap">
        <div class="card">
            <h1>{{ $title }}</h1>
            <p>{{ $note }}</p>

            <span class="label">Frontend URL</span>
            <p><a href="{{ $frontendUrl }}">{{ $frontendUrl }}</a></p>

            <span class="label">Backend API URL</span>
            <p><a href="{{ $apiUrl }}">{{ $apiUrl }}</a></p>

            <span class="label">What to run</span>
            <p><code>cd frontend && npm run dev</code></p>
            <p><code>cd backend && php artisan serve</code></p>
        </div>
    </div>
</body>
</html>

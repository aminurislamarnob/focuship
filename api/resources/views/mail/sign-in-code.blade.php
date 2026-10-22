<x-mail::message>
# Your sign-in code

Enter this code in Focuship to finish signing in:

<x-mail::panel>
# {{ $code }}
</x-mail::panel>

It expires in {{ $minutes }} minutes and can be used once.

If you didn't ask to sign in, you can ignore this email — nobody can get into your account without the code.

Thanks,<br>
Focuship
</x-mail::message>

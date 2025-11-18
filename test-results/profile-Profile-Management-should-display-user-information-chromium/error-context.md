# Page snapshot

```yaml
- generic [ref=e6]:
  - generic [ref=e7]:
    - heading "Sign in" [level=2] [ref=e8]
    - paragraph [ref=e9]: Welcome back! Please sign in to your account.
  - generic [ref=e10]:
    - generic [ref=e11]:
      - generic [ref=e12]: Email address*
      - textbox "Email address*" [ref=e13]:
        - /placeholder: you@example.com
        - text: testadmin@example.com
    - generic [ref=e14]:
      - generic [ref=e15]: Password*
      - textbox "Password*" [active] [ref=e16]:
        - /placeholder: ••••••••
        - text: Admin123!@#
    - generic [ref=e17]:
      - generic [ref=e18]:
        - checkbox "Remember me" [ref=e19]
        - generic [ref=e20]: Remember me
      - link "Forgot password?" [ref=e22] [cursor=pointer]:
        - /url: /forgot-password
    - button "Sign in" [ref=e23] [cursor=pointer]
    - generic [ref=e24]:
      - text: Don't have an account?
      - link "Sign up" [ref=e25] [cursor=pointer]:
        - /url: /register
```
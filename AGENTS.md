<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep uploaded safari content in a shared browser-safe data module and render distinct TanStack routes for each section and detail page, so navigation and business information stay consistent.
- Define all visual styling through the global semantic design system and shared Button variants, so site-wide readability changes remain consistent.
- Enquiries open a prefilled WhatsApp message rather than storing submissions, preserving the supplied website's booking flow.
- Prebundle first-screen React-dependent libraries together and reject outdated dependency requests in Vite, so live previews cannot mix React instances across dependency-optimisation generations.

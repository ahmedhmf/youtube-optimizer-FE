import { Component, inject, type OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-github-callback',
  standalone: true,
  template: `
    <div class="callback-container">
      <p>Processing GitHub authentication...</p>
    </div>
  `,
  styles: [
    `
      .callback-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        text-align: center;
      }
    `,
  ],
})
export class GitHubCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  public ngOnInit(): void {
    // Get the authorization code and state from the URL
    this.route.queryParams.subscribe((params) => {
      const code = params['code'];
      const state = params['state'];
      const error = params['error'];

      if (error) {
        // Send error to parent window
        if (window.opener) {
          window.opener.postMessage(
            {
              type: 'GITHUB_OAUTH_ERROR',
              error: error,
            },
            '*',
          );
          window.close();
        }
      } else if (code && state) {
        // Send success to parent window
        if (window.opener) {
          window.opener.postMessage(
            {
              type: 'GITHUB_OAUTH_SUCCESS',
              code: code,
              state: state,
            },
            '*',
          );
          window.close();
        }
      } else {
        // Missing required parameters
        if (window.opener) {
          window.opener.postMessage(
            {
              type: 'GITHUB_OAUTH_ERROR',
              error: 'Missing required parameters',
            },
            '*',
          );
          window.close();
        }
      }
    });
  }
}

"""
Google Docs Creator

Creates professional Google Docs from merged content using Google Docs API.
"""

import os
import pickle
from typing import Dict, List
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


# If modifying these scopes, delete the file token.pickle.
SCOPES = ['https://www.googleapis.com/auth/documents']


class GoogleDocsCreator:
    """Creates Google Docs using the Google Docs API"""

    def __init__(self, console):
        """
        Initialize Google Docs creator

        Args:
            console: Rich console for output
        """
        self.console = console
        self.creds = None
        self.service = None

    def authenticate(self):
        """
        Authenticate with Google Docs API

        Returns:
            bool: True if authentication successful
        """
        self.console.print("[cyan]Authenticating with Google Docs API...[/cyan]")

        token_path = 'token.pickle'
        creds_path = 'credentials.json'

        # Check if token exists
        if os.path.exists(token_path):
            with open(token_path, 'rb') as token:
                self.creds = pickle.load(token)

        # If no valid credentials, authenticate
        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                try:
                    self.console.print("[cyan]Refreshing access token...[/cyan]")
                    self.creds.refresh(Request())
                except Exception as e:
                    self.console.print(f"[yellow]Token refresh failed: {str(e)}[/yellow]")
                    self.creds = None

            if not self.creds:
                if not os.path.exists(creds_path):
                    self.console.print(f"[red]Error: {creds_path} not found![/red]")
                    self.console.print("[yellow]Please download credentials from Google Cloud Console[/yellow]")
                    return False

                try:
                    flow = InstalledAppFlow.from_client_secrets_file(creds_path, SCOPES)
                    self.creds = flow.run_local_server(port=0)

                    # Save credentials for next run
                    with open(token_path, 'wb') as token:
                        pickle.dump(self.creds, token)

                except Exception as e:
                    self.console.print(f"[red]Authentication failed: {str(e)}[/red]")
                    return False

        try:
            self.service = build('docs', 'v1', credentials=self.creds)
            self.console.print("[green]✓ Authentication successful[/green]")
            return True

        except Exception as e:
            self.console.print(f"[red]Failed to build service: {str(e)}[/red]")
            return False

    def create_document(self, content: str, title: str = "Merged Content") -> str:
        """
        Create a Google Doc with the merged content

        Args:
            content: Merged content string
            title: Document title

        Returns:
            str: URL of created document
        """
        # Authenticate if needed
        if not self.service:
            if not self.authenticate():
                raise Exception("Failed to authenticate with Google Docs API")

        try:
            # Create document
            self.console.print(f"[cyan]Creating Google Doc: '{title}'...[/cyan]")

            document = self.service.documents().create(body={'title': title}).execute()
            doc_id = document.get('documentId')

            self.console.print(f"[green]✓ Document created with ID: {doc_id}[/green]")

            # Insert content
            self._insert_content(doc_id, content)

            # Apply formatting
            self._apply_formatting(doc_id, content)

            doc_url = f"https://docs.google.com/document/d/{doc_id}/edit"
            return doc_url

        except HttpError as error:
            self.console.print(f"[red]HTTP Error: {error}[/red]")
            raise
        except Exception as e:
            self.console.print(f"[red]Error creating document: {str(e)}[/red]")
            raise

    def _insert_content(self, doc_id: str, content: str):
        """
        Insert content into the document

        Args:
            doc_id: Document ID
            content: Content to insert
        """
        self.console.print("[cyan]Inserting content...[/cyan]")

        try:
            requests = [{
                'insertText': {
                    'location': {
                        'index': 1
                    },
                    'text': content
                }
            }]

            self.service.documents().batchUpdate(
                documentId=doc_id,
                body={'requests': requests}
            ).execute()

            self.console.print("[green]✓ Content inserted[/green]")

        except Exception as e:
            self.console.print(f"[red]Error inserting content: {str(e)}[/red]")
            raise

    def _apply_formatting(self, doc_id: str, content: str):
        """
        Apply professional formatting to the document

        Args:
            doc_id: Document ID
            content: Document content (for analysis)
        """
        self.console.print("[cyan]Applying formatting...[/cyan]")

        try:
            requests = []

            # Parse content to find headings (markdown style)
            lines = content.split('\n')
            index = 1

            for line in lines:
                line_length = len(line) + 1  # +1 for newline

                # Detect headings
                if line.startswith('# '):
                    # Heading 1
                    requests.append({
                        'updateParagraphStyle': {
                            'range': {
                                'startIndex': index,
                                'endIndex': index + line_length - 1
                            },
                            'paragraphStyle': {
                                'namedStyleType': 'HEADING_1'
                            },
                            'fields': 'namedStyleType'
                        }
                    })
                elif line.startswith('## '):
                    # Heading 2
                    requests.append({
                        'updateParagraphStyle': {
                            'range': {
                                'startIndex': index,
                                'endIndex': index + line_length - 1
                            },
                            'paragraphStyle': {
                                'namedStyleType': 'HEADING_2'
                            },
                            'fields': 'namedStyleType'
                        }
                    })
                elif line.startswith('### '):
                    # Heading 3
                    requests.append({
                        'updateParagraphStyle': {
                            'range': {
                                'startIndex': index,
                                'endIndex': index + line_length - 1
                            },
                            'paragraphStyle': {
                                'namedStyleType': 'HEADING_3'
                            },
                            'fields': 'namedStyleType'
                        }
                    })

                index += line_length

            # Apply all formatting requests
            if requests:
                # Batch requests in chunks (API limit)
                chunk_size = 100
                for i in range(0, len(requests), chunk_size):
                    chunk = requests[i:i + chunk_size]
                    self.service.documents().batchUpdate(
                        documentId=doc_id,
                        body={'requests': chunk}
                    ).execute()

                self.console.print(f"[green]✓ Applied {len(requests)} formatting changes[/green]")

            # Set document margins and font
            style_requests = [
                {
                    'updateDocumentStyle': {
                        'documentStyle': {
                            'marginTop': {'magnitude': 72, 'unit': 'PT'},
                            'marginBottom': {'magnitude': 72, 'unit': 'PT'},
                            'marginLeft': {'magnitude': 72, 'unit': 'PT'},
                            'marginRight': {'magnitude': 72, 'unit': 'PT'}
                        },
                        'fields': 'marginTop,marginBottom,marginLeft,marginRight'
                    }
                }
            ]

            self.service.documents().batchUpdate(
                documentId=doc_id,
                body={'requests': style_requests}
            ).execute()

            self.console.print("[green]✓ Formatting complete[/green]")

        except Exception as e:
            self.console.print(f"[yellow]Warning: Could not apply all formatting: {str(e)}[/yellow]")
            # Don't raise - formatting is optional

    def format_as_professional(self, doc_id: str):
        """
        Apply professional styling to the document

        Args:
            doc_id: Document ID
        """
        try:
            requests = [
                # Set default font
                {
                    'updateTextStyle': {
                        'range': {
                            'startIndex': 1,
                            'endIndex': 1000000  # Large number to cover entire document
                        },
                        'textStyle': {
                            'fontSize': {
                                'magnitude': 11,
                                'unit': 'PT'
                            },
                            'weightedFontFamily': {
                                'fontFamily': 'Arial'
                            }
                        },
                        'fields': 'fontSize,weightedFontFamily'
                    }
                }
            ]

            self.service.documents().batchUpdate(
                documentId=doc_id,
                body={'requests': requests}
            ).execute()

        except Exception as e:
            self.console.print(f"[yellow]Warning: Could not apply professional styling: {str(e)}[/yellow]")

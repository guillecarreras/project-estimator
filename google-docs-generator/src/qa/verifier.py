"""
QA Verifier

Performs character-by-character verification to ensure no content was
summarized, rephrased, or lost during the merge process.
"""

from typing import List, Dict
import difflib
from collections import Counter


class QAVerifier:
    """Quality assurance verifier for content merging"""

    def __init__(self, console):
        """
        Initialize QA verifier

        Args:
            console: Rich console for output
        """
        self.console = console

    def verify(self, original_content: List[Dict], merged_content: str) -> Dict:
        """
        Verify that merged content matches original content without summarization or rephrasing

        Args:
            original_content: List of original parsed content
            merged_content: Merged content string

        Returns:
            dict: Verification results with pass/fail status and issues found
        """
        self.console.print("[bold cyan]Running QA Verification...[/bold cyan]")

        results = {
            'passed': True,
            'issues': [],
            'statistics': {},
            'checks': {}
        }

        # Check 1: Character count verification
        self.console.print("[cyan]  Check 1: Character count verification...[/cyan]")
        char_check = self._verify_character_count(original_content, merged_content)
        results['checks']['character_count'] = char_check

        if not char_check['passed']:
            results['passed'] = False
            results['issues'].extend(char_check['issues'])

        # Check 2: Word count verification
        self.console.print("[cyan]  Check 2: Word count verification...[/cyan]")
        word_check = self._verify_word_count(original_content, merged_content)
        results['checks']['word_count'] = word_check

        if not word_check['passed']:
            results['passed'] = False
            results['issues'].extend(word_check['issues'])

        # Check 3: Content presence verification
        self.console.print("[cyan]  Check 3: Content presence verification...[/cyan]")
        content_check = self._verify_content_presence(original_content, merged_content)
        results['checks']['content_presence'] = content_check

        if not content_check['passed']:
            results['passed'] = False
            results['issues'].extend(content_check['issues'])

        # Check 4: No summarization detection
        self.console.print("[cyan]  Check 4: Summarization detection...[/cyan]")
        summary_check = self._detect_summarization(original_content, merged_content)
        results['checks']['summarization'] = summary_check

        if not summary_check['passed']:
            results['passed'] = False
            results['issues'].extend(summary_check['issues'])

        # Check 5: Sentence-level verification
        self.console.print("[cyan]  Check 5: Sentence-level verification...[/cyan]")
        sentence_check = self._verify_sentences(original_content, merged_content)
        results['checks']['sentence_verification'] = sentence_check

        if not sentence_check['passed']:
            results['passed'] = False
            results['issues'].extend(sentence_check['issues'])

        # Calculate statistics
        results['statistics'] = self._calculate_statistics(original_content, merged_content)

        # Display results
        if results['passed']:
            self.console.print("[bold green]✓ All QA checks passed![/bold green]")
        else:
            self.console.print(f"[bold red]✗ QA checks failed with {len(results['issues'])} issues[/bold red]")

        return results

    def _verify_character_count(self, original_content: List[Dict], merged_content: str) -> Dict:
        """
        Verify character counts match (allowing for formatting differences)

        Args:
            original_content: Original content list
            merged_content: Merged content string

        Returns:
            dict: Check results
        """
        # Count original characters (excluding whitespace variations)
        original_chars = 0
        for item in original_content:
            content = item['content']
            text = content.get('text', '')
            # Normalize whitespace
            normalized = ''.join(text.split())
            original_chars += len(normalized)

        # Count merged characters
        merged_normalized = ''.join(merged_content.split())
        merged_chars = len(merged_normalized)

        # Allow 5% tolerance for formatting differences
        tolerance = 0.05
        min_expected = original_chars * (1 - tolerance)
        max_expected = original_chars * (1 + tolerance)

        passed = min_expected <= merged_chars <= max_expected

        result = {
            'passed': passed,
            'original_chars': original_chars,
            'merged_chars': merged_chars,
            'difference': merged_chars - original_chars,
            'difference_pct': ((merged_chars - original_chars) / original_chars * 100) if original_chars > 0 else 0,
            'issues': []
        }

        if not passed:
            result['issues'].append(
                f"Character count mismatch: Original={original_chars}, Merged={merged_chars}, "
                f"Diff={result['difference']} ({result['difference_pct']:.1f}%)"
            )

        return result

    def _verify_word_count(self, original_content: List[Dict], merged_content: str) -> Dict:
        """
        Verify word counts match

        Args:
            original_content: Original content list
            merged_content: Merged content string

        Returns:
            dict: Check results
        """
        # Count original words
        original_words = 0
        for item in original_content:
            content = item['content']
            text = content.get('text', '')
            words = text.split()
            original_words += len(words)

        # Count merged words
        merged_words = len(merged_content.split())

        # Allow 5% tolerance
        tolerance = 0.05
        min_expected = original_words * (1 - tolerance)
        max_expected = original_words * (1 + tolerance)

        passed = min_expected <= merged_words <= max_expected

        result = {
            'passed': passed,
            'original_words': original_words,
            'merged_words': merged_words,
            'difference': merged_words - original_words,
            'difference_pct': ((merged_words - original_words) / original_words * 100) if original_words > 0 else 0,
            'issues': []
        }

        if not passed:
            result['issues'].append(
                f"Word count mismatch: Original={original_words}, Merged={merged_words}, "
                f"Diff={result['difference']} ({result['difference_pct']:.1f}%)"
            )

        return result

    def _verify_content_presence(self, original_content: List[Dict], merged_content: str) -> Dict:
        """
        Verify that key content from original is present in merged

        Args:
            original_content: Original content list
            merged_content: Merged content string

        Returns:
            dict: Check results
        """
        issues = []
        missing_chunks = []

        merged_lower = merged_content.lower()

        for item in original_content:
            content = item['content']
            text = content.get('text', '')

            # Split into sentences or chunks
            sentences = [s.strip() for s in text.split('.') if len(s.strip()) > 20]

            missing_count = 0
            for sentence in sentences:
                # Check if sentence (or significant portion) exists in merged
                sentence_lower = sentence.lower()
                if len(sentence_lower) < 20:
                    continue

                # For long sentences, check if at least 80% of words are present
                words = sentence_lower.split()
                if len(words) < 3:
                    continue

                found_words = sum(1 for word in words if word in merged_lower)
                presence_ratio = found_words / len(words)

                if presence_ratio < 0.8:
                    missing_count += 1
                    if len(missing_chunks) < 5:  # Limit examples
                        missing_chunks.append(sentence[:100])

            if missing_count > len(sentences) * 0.1:  # More than 10% missing
                issues.append(
                    f"File '{item['file']}' has {missing_count} potentially missing sentences"
                )

        result = {
            'passed': len(issues) == 0,
            'issues': issues,
            'missing_examples': missing_chunks
        }

        return result

    def _detect_summarization(self, original_content: List[Dict], merged_content: str) -> Dict:
        """
        Detect if content was summarized instead of copied verbatim

        Args:
            original_content: Original content list
            merged_content: Merged content string

        Returns:
            dict: Check results
        """
        issues = []

        # Calculate content reduction ratio
        original_total_chars = sum(
            len(item['content'].get('text', ''))
            for item in original_content
        )

        merged_chars = len(merged_content)

        # If merged is significantly shorter, it might be summarized
        reduction_ratio = merged_chars / original_total_chars if original_total_chars > 0 else 1

        # Allow up to 15% reduction for formatting, but flag if more
        if reduction_ratio < 0.85:
            issues.append(
                f"Content appears to be summarized: {reduction_ratio*100:.1f}% of original length"
            )

        result = {
            'passed': reduction_ratio >= 0.85,
            'reduction_ratio': reduction_ratio,
            'issues': issues
        }

        return result

    def _verify_sentences(self, original_content: List[Dict], merged_content: str) -> Dict:
        """
        Verify sentences are copied verbatim, not rephrased

        Args:
            original_content: Original content list
            merged_content: Merged content string

        Returns:
            dict: Check results
        """
        issues = []
        sample_size = 10  # Check sample of sentences

        merged_lower = merged_content.lower()

        checked = 0
        matched = 0

        for item in original_content:
            content = item['content']
            text = content.get('text', '')

            # Extract sentences
            sentences = [s.strip() for s in text.split('.') if len(s.strip()) > 30]

            # Check sample of sentences
            for sentence in sentences[:sample_size]:
                sentence_lower = sentence.lower()
                checked += 1

                # Check for exact or near-exact match
                if sentence_lower in merged_lower:
                    matched += 1
                else:
                    # Check with some tolerance for punctuation differences
                    cleaned = ''.join(c for c in sentence_lower if c.isalnum() or c.isspace())
                    if cleaned in merged_lower:
                        matched += 1

        match_ratio = matched / checked if checked > 0 else 1

        # Expect at least 80% exact matches
        if match_ratio < 0.8:
            issues.append(
                f"Only {match_ratio*100:.1f}% of sampled sentences found verbatim - content may be rephrased"
            )

        result = {
            'passed': match_ratio >= 0.8,
            'match_ratio': match_ratio,
            'checked': checked,
            'matched': matched,
            'issues': issues
        }

        return result

    def _calculate_statistics(self, original_content: List[Dict], merged_content: str) -> Dict:
        """
        Calculate various statistics for reporting

        Args:
            original_content: Original content list
            merged_content: Merged content string

        Returns:
            dict: Statistics
        """
        total_original_chars = sum(
            len(item['content'].get('text', ''))
            for item in original_content
        )

        total_original_words = sum(
            len(item['content'].get('text', '').split())
            for item in original_content
        )

        merged_words = len(merged_content.split())
        merged_chars = len(merged_content)

        return {
            'original_files': len(original_content),
            'original_total_chars': total_original_chars,
            'original_total_words': total_original_words,
            'merged_chars': merged_chars,
            'merged_words': merged_words,
            'char_retention_pct': (merged_chars / total_original_chars * 100) if total_original_chars > 0 else 0,
            'word_retention_pct': (merged_words / total_original_words * 100) if total_original_words > 0 else 0
        }

'use client';

import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Send } from '@/lib/icon-mapping';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserFeedback, UserRole } from '@/types/analytics';

interface FeedbackWidgetProps {
  contentId: string;
  contentType: 'guide' | 'api' | 'component';
  onFeedback: (feedback: UserFeedback) => void;
  showRating?: boolean;
  showComments?: boolean;
  userRole?: UserRole;
  className?: string;
}

export function FeedbackWidget({
  contentId,
  contentType,
  onFeedback,
  showRating = true,
  showComments = true,
  userRole = 'guest',
  className = ''
}: FeedbackWidgetProps) {
  const [rating, setRating] = useState<number>(0);
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  const handleHelpfulClick = (isHelpful: boolean) => {
    setHelpful(isHelpful);
    if (!showComments) {
      submitFeedback(0, isHelpful, '', '');
    }
  };

  const submitFeedback = async (
    ratingValue: number,
    helpfulValue: boolean,
    commentValue: string,
    suggestionsValue: string
  ) => {
    setIsSubmitting(true);
    
    const feedback: UserFeedback = {
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contentId,
      contentType,
      rating: ratingValue,
      helpful: helpfulValue,
      comment: commentValue.trim() || undefined,
      suggestions: suggestionsValue.trim() || undefined,
      userRole,
      timestamp: new Date(),
      tags: generateFeedbackTags(ratingValue, helpfulValue, commentValue)
    };

    try {
      await onFeedback(feedback);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (rating > 0 || helpful !== null) {
      submitFeedback(rating, helpful ?? false, comment, suggestions);
    }
  };

  const generateFeedbackTags = (
    ratingValue: number,
    helpfulValue: boolean,
    commentValue: string
  ): string[] => {
    const tags: string[] = [];
    
    if (ratingValue >= 4) tags.push('positive');
    else if (ratingValue <= 2) tags.push('negative');
    else if (ratingValue === 3) tags.push('neutral');
    
    if (helpfulValue) tags.push('helpful');
    else tags.push('not-helpful');
    
    if (commentValue.toLowerCase().includes('confusing')) tags.push('clarity-issue');
    if (commentValue.toLowerCase().includes('missing')) tags.push('incomplete');
    if (commentValue.toLowerCase().includes('error')) tags.push('accuracy-issue');
    if (commentValue.toLowerCase().includes('slow')) tags.push('performance-issue');
    
    return tags;
  };

  if (isSubmitted) {
    return (
      <Card className={`border-green-200 bg-green-50 ${className}`}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-green-700">
            <ThumbsUp className="h-4 w-4" />
            <span className="text-sm font-medium">Thank you for your feedback!</span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            Your input helps us improve our documentation.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-gray-200 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Was this helpful?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Helpful/Not Helpful Buttons */}
        <div className="flex gap-2">
          <Button
            variant={helpful === true ? "default" : "outline"}
            size="sm"
            onClick={() => handleHelpfulClick(true)}
            className="flex items-center gap-1"
          >
            <ThumbsUp className="h-3 w-3" />
            Yes
          </Button>
          <Button
            variant={helpful === false ? "default" : "outline"}
            size="sm"
            onClick={() => handleHelpfulClick(false)}
            className="flex items-center gap-1"
          >
            <ThumbsDown className="h-3 w-3" />
            No
          </Button>
        </div>

        {/* Star Rating */}
        {showRating && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Rate this content:</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRatingClick(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-4 w-4 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comment Form */}
        {showComments && (helpful !== null || rating > 0) && (
          <div className="space-y-3">
            {!showCommentForm ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCommentForm(true)}
                className="text-xs"
              >
                Add a comment (optional)
              </Button>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">
                    Tell us more about your experience:
                  </label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What did you find helpful or confusing?"
                    className="mt-1 text-sm"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">
                    Suggestions for improvement:
                  </label>
                  <Textarea
                    value={suggestions}
                    onChange={(e) => setSuggestions(e.target.value)}
                    placeholder="How could we make this better?"
                    className="mt-1 text-sm"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        {(rating > 0 || helpful !== null) && (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="sm"
            className="flex items-center gap-1"
          >
            <Send className="h-3 w-3" />
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
"use client"

import { useState } from "react"
import styles from "./rating-dialog.module.css"

interface RatingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rating: number
  onRatingChange: (rating: number) => void
  onSubmit: () => Promise<void>
  isSubmitting: boolean
}

export function RatingDialog({
  open,
  onOpenChange,
  rating,
  onRatingChange,
  onSubmit,
  isSubmitting,
}: RatingDialogProps) {
  const [hoverRating, setHoverRating] = useState(0)

  if (!open) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.header}>
          <h2 className={styles.title}>Rate this destination</h2>
          <p className={styles.description}>
            Share your experience by rating this destination. Your feedback helps others make better travel decisions.
          </p>
        </div>

        <div className={styles.content}>
          <div className={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={styles.starButton}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => onRatingChange(star)}
              >
                <span className={`${styles.star} ${star <= (hoverRating || rating) ? styles.starFilled : ""}`}>★</span>
                <span className={styles.srOnly}>Rate {star} stars</span>
              </button>
            ))}
          </div>
          <p className={styles.ratingText}>
            {rating === 0 ? "Select a rating" : `You selected ${rating} star${rating !== 1 ? "s" : ""}`}
          </p>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelButton} onClick={() => onOpenChange(false)}>
            Cancel
          </button>
          <button
            type="button"
            className={`${styles.submitButton} ${rating === 0 || isSubmitting ? styles.disabled : ""}`}
            onClick={onSubmit}
            disabled={rating === 0 || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Rating"}
          </button>
        </div>
      </div>
    </div>
  )
}

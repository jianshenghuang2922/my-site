export interface ReviewFrontMatter {
  university: string;
  major: string;
  rating: number;
  title: string;
  date: string;
}

export interface Review extends ReviewFrontMatter {
  slug: string;
  content: string;
}

export interface GetReviewsOptions {
  university?: string;
}

export interface SubmitReviewPayload {
  university: string;
  major: string;
  rating: number;
  title: string;
  content: string;
}

export interface SubmitReviewResponse {
  success: boolean;
  message: string;
  pullRequestUrl?: string;
  branch?: string;
  filePath?: string;
}

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AnimeCardSkeleton, CarouselSkeleton, ScheduleSkeleton } from '@/components/loaders/AnimeCardSkeleton';

describe('AnimeCardSkeleton', () => {
  it('renders skeleton with animate-pulse class', () => {
    render(<AnimeCardSkeleton />);
    const pulses = document.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBeGreaterThan(0);
  });

  it('renders skeleton with aspect ratio container', () => {
    const { container } = render(<AnimeCardSkeleton />);
    const wrapper = container.querySelector('[class*="aspect-3-4"]') || container.querySelector('[class*="aspect"]');
    expect(wrapper).toBeInTheDocument();
  });

  it('shows rating skeleton when showRating is true', () => {
    const { container } = render(<AnimeCardSkeleton showRating={true} />);
    const ratingSkeletons = container.querySelectorAll('.top-2');
    expect(ratingSkeletons.length).toBe(1);
  });

  it('hides rating skeleton when showRating is false', () => {
    const { container } = render(<AnimeCardSkeleton showRating={false} />);
    const ratingSkeletons = container.querySelectorAll('.top-2');
    expect(ratingSkeletons.length).toBe(0);
  });

  it('renders with rounded-lg class', () => {
    const { container } = render(<AnimeCardSkeleton />);
    const roundedElements = container.querySelectorAll('.rounded-lg');
    expect(roundedElements.length).toBeGreaterThan(0);
  });
});

describe('CarouselSkeleton', () => {
  it('renders multiple skeleton cards', () => {
    const { container } = render(<CarouselSkeleton />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(6);
  });

  it('renders with flex gap styling', () => {
    const { container } = render(<CarouselSkeleton />);
    const flexContainer = container.querySelector('[class*="flex"]');
    expect(flexContainer).toBeInTheDocument();
  });
});

describe('ScheduleSkeleton', () => {
  it('renders date button skeletons', () => {
    const { container } = render(<ScheduleSkeleton />);
    const dateButtons = container.querySelectorAll('.h-8');
    expect(dateButtons.length).toBeGreaterThanOrEqual(5);
  });

  it('renders table skeleton structure', () => {
    const { container } = render(<ScheduleSkeleton />);
    const table = container.querySelector('.rounded-lg');
    expect(table).toBeInTheDocument();
  });

  it('renders schedule row skeletons', () => {
    const { container } = render(<ScheduleSkeleton />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(4);
  });

  it('renders with hidden md blocks for episodes column', () => {
    const { container } = render(<ScheduleSkeleton />);
    const mdHidden = container.querySelectorAll('[class*="hidden"][class*="md:block"]');
    expect(mdHidden.length).toBeGreaterThan(0);
  });

  it('renders with hidden lg blocks for next/prev columns', () => {
    const { container } = render(<ScheduleSkeleton />);
    const lgHidden = container.querySelectorAll('[class*="hidden"][class*="lg:block"]');
    expect(lgHidden.length).toBeGreaterThan(0);
  });
});
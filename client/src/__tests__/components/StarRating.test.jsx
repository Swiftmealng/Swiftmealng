import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StarRating from '../../components/StarRating';

describe('StarRating Component', () => {
  it('should render 5 star buttons', () => {
    const mockOnRate = vi.fn();
    const mockOnHover = vi.fn();
    const mockOnLeave = vi.fn();

    const { container } = render(
      <StarRating
        rating={0}
        hoveredRating={0}
        onRate={mockOnRate}
        onHover={mockOnHover}
        onLeave={mockOnLeave}
      />
    );

    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(5);
  });

  it('should render label when provided', () => {
    const mockOnRate = vi.fn();
    const mockOnHover = vi.fn();
    const mockOnLeave = vi.fn();

    render(
      <StarRating
        rating={0}
        hoveredRating={0}
        onRate={mockOnRate}
        onHover={mockOnHover}
        onLeave={mockOnLeave}
        label="Rate your experience"
      />
    );

    expect(screen.getByText('Rate your experience')).toBeInTheDocument();
  });

  it('should not render label when not provided', () => {
    const mockOnRate = vi.fn();
    const mockOnHover = vi.fn();
    const mockOnLeave = vi.fn();

    const { container } = render(
      <StarRating
        rating={0}
        hoveredRating={0}
        onRate={mockOnRate}
        onHover={mockOnHover}
        onLeave={mockOnLeave}
      />
    );

    const label = container.querySelector('label');
    expect(label).not.toBeInTheDocument();
  });

  it('should call onRate when star is clicked', () => {
    const mockOnRate = vi.fn();
    const mockOnHover = vi.fn();
    const mockOnLeave = vi.fn();

    const { container } = render(
      <StarRating
        rating={0}
        hoveredRating={0}
        onRate={mockOnRate}
        onHover={mockOnHover}
        onLeave={mockOnLeave}
      />
    );

    const buttons = container.querySelectorAll('button');
    fireEvent.click(buttons[2]); // Click third star

    expect(mockOnRate).toHaveBeenCalledWith(3);
  });

  it('should call onHover when mouse enters star', () => {
    const mockOnRate = vi.fn();
    const mockOnHover = vi.fn();
    const mockOnLeave = vi.fn();

    const { container } = render(
      <StarRating
        rating={0}
        hoveredRating={0}
        onRate={mockOnRate}
        onHover={mockOnHover}
        onLeave={mockOnLeave}
      />
    );

    const buttons = container.querySelectorAll('button');
    fireEvent.mouseEnter(buttons[3]); // Hover fourth star

    expect(mockOnHover).toHaveBeenCalledWith(4);
  });

  it('should call onLeave when mouse leaves star', () => {
    const mockOnRate = vi.fn();
    const mockOnHover = vi.fn();
    const mockOnLeave = vi.fn();

    const { container } = render(
      <StarRating
        rating={0}
        hoveredRating={0}
        onRate={mockOnRate}
        onHover={mockOnHover}
        onLeave={mockOnLeave}
      />
    );

    const buttons = container.querySelectorAll('button');
    fireEvent.mouseLeave(buttons[0]);

    expect(mockOnLeave).toHaveBeenCalled();
  });

  it('should display filled stars based on rating', () => {
    const mockOnRate = vi.fn();
    const mockOnHover = vi.fn();
    const mockOnLeave = vi.fn();

    const { container } = render(
      <StarRating
        rating={3}
        hoveredRating={0}
        onRate={mockOnRate}
        onHover={mockOnHover}
        onLeave={mockOnLeave}
      />
    );

    const svgs = container.querySelectorAll('svg');
    
    // First 3 stars should be filled (yellow)
    expect(svgs[0]).toHaveClass('text-yellow-400', 'fill-current');
    expect(svgs[1]).toHaveClass('text-yellow-400', 'fill-current');
    expect(svgs[2]).toHaveClass('text-yellow-400', 'fill-current');
    
    // Last 2 stars should be empty (gray)
    expect(svgs[3]).toHaveClass('text-gray-300');
    expect(svgs[4]).toHaveClass('text-gray-300');
  });

  it('should prioritize hoveredRating over rating', () => {
    const mockOnRate = vi.fn();
    const mockOnHover = vi.fn();
    const mockOnLeave = vi.fn();

    const { container } = render(
      <StarRating
        rating={2}
        hoveredRating={4}
        onRate={mockOnRate}
        onHover={mockOnHover}
        onLeave={mockOnLeave}
      />
    );

    const svgs = container.querySelectorAll('svg');
    
    // First 4 stars should be filled based on hoveredRating
    expect(svgs[0]).toHaveClass('text-yellow-400', 'fill-current');
    expect(svgs[1]).toHaveClass('text-yellow-400', 'fill-current');
    expect(svgs[2]).toHaveClass('text-yellow-400', 'fill-current');
    expect(svgs[3]).toHaveClass('text-yellow-400', 'fill-current');
    
    // Last star should be empty
    expect(svgs[4]).toHaveClass('text-gray-300');
  });

  it('should handle rating of 0', () => {
    const mockOnRate = vi.fn();
    const mockOnHover = vi.fn();
    const mockOnLeave = vi.fn();

    const { container } = render(
      <StarRating
        rating={0}
        hoveredRating={0}
        onRate={mockOnRate}
        onHover={mockOnHover}
        onLeave={mockOnLeave}
      />
    );

    const svgs = container.querySelectorAll('svg');
    
    // All stars should be empty
    svgs.forEach(svg => {
      expect(svg).toHaveClass('text-gray-300');
    });
  });

  it('should handle rating of 5', () => {
    const mockOnRate = vi.fn();
    const mockOnHover = vi.fn();
    const mockOnLeave = vi.fn();

    const { container } = render(
      <StarRating
        rating={5}
        hoveredRating={0}
        onRate={mockOnRate}
        onHover={mockOnHover}
        onLeave={mockOnLeave}
      />
    );

    const svgs = container.querySelectorAll('svg');
    
    // All stars should be filled
    svgs.forEach(svg => {
      expect(svg).toHaveClass('text-yellow-400', 'fill-current');
    });
  });

  it('should have hover scale effect on buttons', () => {
    const mockOnRate = vi.fn();
    const mockOnHover = vi.fn();
    const mockOnLeave = vi.fn();

    const { container } = render(
      <StarRating
        rating={0}
        hoveredRating={0}
        onRate={mockOnRate}
        onHover={mockOnHover}
        onLeave={mockOnLeave}
      />
    );

    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      expect(button).toHaveClass('transition-transform', 'hover:scale-110');
    });
  });
});
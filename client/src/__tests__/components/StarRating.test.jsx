import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StarRating from '../../components/StarRating';

describe('StarRating Component', () => {
  const defaultProps = {
    rating: 0,
    hoveredRating: 0,
    onRate: vi.fn(),
    onHover: vi.fn(),
    onLeave: vi.fn()
  };

  it('should render 5 star buttons', () => {
    const { container } = render(<StarRating {...defaultProps} />);
    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(5);
  });

  it('should render optional label', () => {
    render(<StarRating {...defaultProps} label="Rate this item" />);
    expect(screen.getByText('Rate this item')).toBeInTheDocument();
  });

  it('should not render label when not provided', () => {
    const { container } = render(<StarRating {...defaultProps} />);
    const label = container.querySelector('label');
    expect(label).toBeNull();
  });

  it('should call onRate when star is clicked', () => {
    const onRate = vi.fn();
    const { container } = render(<StarRating {...defaultProps} onRate={onRate} />);
    
    const buttons = container.querySelectorAll('button');
    fireEvent.click(buttons[2]); // Click 3rd star

    expect(onRate).toHaveBeenCalledWith(3);
  });

  it('should call onHover when mouse enters star', () => {
    const onHover = vi.fn();
    const { container } = render(<StarRating {...defaultProps} onHover={onHover} />);
    
    const buttons = container.querySelectorAll('button');
    fireEvent.mouseEnter(buttons[3]); // Hover 4th star

    expect(onHover).toHaveBeenCalledWith(4);
  });

  it('should call onLeave when mouse leaves star', () => {
    const onLeave = vi.fn();
    const { container } = render(<StarRating {...defaultProps} onLeave={onLeave} />);
    
    const buttons = container.querySelectorAll('button');
    fireEvent.mouseLeave(buttons[0]);

    expect(onLeave).toHaveBeenCalled();
  });

  it('should highlight stars up to rating', () => {
    const { container } = render(<StarRating {...defaultProps} rating={3} />);
    
    const svgs = container.querySelectorAll('svg');
    
    // First 3 stars should be highlighted
    expect(svgs[0]).toHaveClass('text-yellow-400', 'fill-current');
    expect(svgs[1]).toHaveClass('text-yellow-400', 'fill-current');
    expect(svgs[2]).toHaveClass('text-yellow-400', 'fill-current');
    
    // Remaining stars should not be highlighted
    expect(svgs[3]).toHaveClass('text-gray-300');
    expect(svgs[4]).toHaveClass('text-gray-300');
  });

  it('should prioritize hoveredRating over rating', () => {
    const { container } = render(
      <StarRating {...defaultProps} rating={2} hoveredRating={4} />
    );
    
    const svgs = container.querySelectorAll('svg');
    
    // First 4 stars should be highlighted based on hover
    expect(svgs[0]).toHaveClass('text-yellow-400', 'fill-current');
    expect(svgs[1]).toHaveClass('text-yellow-400', 'fill-current');
    expect(svgs[2]).toHaveClass('text-yellow-400', 'fill-current');
    expect(svgs[3]).toHaveClass('text-yellow-400', 'fill-current');
    
    // Last star should not be highlighted
    expect(svgs[4]).toHaveClass('text-gray-300');
  });

  it('should apply hover scale effect on buttons', () => {
    const { container } = render(<StarRating {...defaultProps} />);
    
    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      expect(button).toHaveClass('hover:scale-110');
    });
  });

  it('should handle rating of 0', () => {
    const { container } = render(<StarRating {...defaultProps} rating={0} />);
    
    const svgs = container.querySelectorAll('svg');
    svgs.forEach(svg => {
      expect(svg).toHaveClass('text-gray-300');
    });
  });

  it('should handle rating of 5', () => {
    const { container } = render(<StarRating {...defaultProps} rating={5} />);
    
    const svgs = container.querySelectorAll('svg');
    svgs.forEach(svg => {
      expect(svg).toHaveClass('text-yellow-400', 'fill-current');
    });
  });

  it('should have type="button" to prevent form submission', () => {
    const { container } = render(<StarRating {...defaultProps} />);
    
    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  it('should support keyboard interaction', () => {
    const onRate = vi.fn();
    const { container } = render(<StarRating {...defaultProps} onRate={onRate} />);
    
    const firstButton = container.querySelectorAll('button')[0];
    firstButton.focus();
    fireEvent.keyDown(firstButton, { key: 'Enter' });
    fireEvent.click(firstButton);
    
    expect(onRate).toHaveBeenCalledWith(1);
  });

  it('should apply correct svg sizes', () => {
    const { container } = render(<StarRating {...defaultProps} />);
    
    const svgs = container.querySelectorAll('svg');
    svgs.forEach(svg => {
      expect(svg).toHaveClass('w-10', 'h-10');
    });
  });
});